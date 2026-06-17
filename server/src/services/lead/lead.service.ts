import { Lead, ILead } from '../../models/lead.model';
import { GeminiProvider } from '../ai/providers/gemini.provider';
import { LeadAnalysisInput } from '../../types/ai.types';

/**
 * LeadService — Business logic layer
 *
 * Professor Note — What this service does NOT do:
 * - It does not know about HTTP (no req, no res, no status codes)
 * - It does not call Gemini directly (only through the AIProvider interface)
 * - It does not format API responses
 *
 * What it DOES do:
 * - Orchestrates the lead creation and analysis flow
 * - Handles database operations
 * - Manages state transitions (pending → analyzed → failed)
 *
 * This separation means:
 * - You can call this service from a REST controller today
 * - And from a background job queue tomorrow
 * - Without changing a single line in this file
 */

// Instantiate the AI provider once — not on every request
// This avoids creating a new object for every API call
const aiProvider = new GeminiProvider();

export class LeadService {

  /**
   * createAndAnalyzeLead
   *
   * Flow:
   * 1. Save lead to DB with status 'pending' — we have the data even if AI fails
   * 2. Call AI provider
   * 3. Update lead with analysis and status 'analyzed'
   * 4. If AI fails, update status to 'failed' with reason
   * 5. Return the lead regardless
   *
   * Why save before calling AI?
   * If the AI call hangs for 25 seconds and the client disconnects,
   * we still have the lead in the database.
   * The lead is never lost because of an AI timeout.
   */
  async createAndAnalyzeLead(input: LeadAnalysisInput): Promise<ILead> {
    // Step 1: Save immediately with pending status
    const lead = new Lead({ ...input, status: 'pending' });
    await lead.save();

    console.log(`[LeadService] Created lead ${lead.id} for ${input.company}`);

    // Step 2: Analyze with AI
    try {
      const analysis = await aiProvider.analyzeLead(input);

      // Step 3: Update with successful analysis
      lead.aiAnalysis = analysis;
      lead.status = 'analyzed';

      console.log(
        `[LeadService] Lead ${lead.id} analyzed. Score: ${analysis.leadScore.score} (${analysis.leadScore.category})`
      );
    } catch (error) {
      // Step 4: Record the failure — do not rethrow, return the failed lead
      const reason = error instanceof Error ? error.message : 'Unknown AI error';
      lead.status = 'failed';
      lead.failureReason = reason;

      console.error(`[LeadService] AI analysis failed for lead ${lead.id}:`, reason);
    }

    // Step 5: Save final state
    await lead.save();
    return lead;
  }

  async getAllLeads(filters: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ leads: ILead[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20)); // Cap at 50
    const skip = (page - 1) * limit;

    // Build query dynamically based on provided filters
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) {
      query['aiAnalysis.leadScore.category'] = filters.category;
    }

    /**
     * Promise.all runs both queries in parallel
     * Instead of: count (wait) → then find (wait) = 2x database round trips
     * We do: count + find simultaneously = 1x round trip time
     * Always parallelize independent database operations
     */
    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    return {
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadById(id: string): Promise<ILead | null> {
    return Lead.findById(id);
  }

  async humanReviewLead(
    id: string,
    reviewData: {
      humanReviewedBy: string;
      humanOverrideScore?: number;
      humanNotes?: string;
    }
  ): Promise<ILead | null> {
    return Lead.findByIdAndUpdate(
      id,
      {
        humanReviewed: true,
        humanReviewedAt: new Date(),
        ...reviewData,
      },
      { new: true } // Return the updated document, not the original
    );
  }
}