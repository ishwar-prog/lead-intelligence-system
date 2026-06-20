import { Lead, ILead } from '../../models/lead.model';
import { LeadAnalysisInput } from '../../types/ai.types';
import { enqueueLeadAnalysis } from '../../queues/leadAnalysis.queue';

/**
 * LeadService — UPDATED for Phase 2
 *
 * Professor Note on what changed and why:
 *
 * BEFORE (Phase 1): This service called GeminiProvider directly and
 * waited for the result before returning. The HTTP request stayed open
 * for the entire AI call duration.
 *
 * NOW (Phase 2): This service saves the lead, adds a job to the queue,
 * and returns IMMEDIATELY. The actual AI call happens later, in the
 * worker process, completely decoupled from this HTTP request.
 *
 * Notice: GeminiProvider is no longer imported here at all. This service
 * doesn't know or care which AI provider does the work, or even that
 * it's a 'queue' specifically. It just knows "enqueue analysis work."
 * That's good separation of concerns holding up across a real
 * architectural change.
 */
export class LeadService {

  async createAndAnalyzeLead(input: LeadAnalysisInput): Promise<ILead> {
    // Step 1: Save immediately with pending status (unchanged from Phase 1)
    const lead = new Lead({ ...input, status: 'pending' });
    await lead.save();

    console.log(`[LeadService] Created lead ${lead.id} for ${input.company}`);

    // Step 2: Enqueue the analysis job instead of calling AI inline
    // This returns almost instantly - it's just adding data to Redis
    await enqueueLeadAnalysis({
      leadId: lead.id,
      input,
    });

    console.log(`[LeadService] Enqueued analysis job for lead ${lead.id}`);

    // Step 3: Return immediately - the client does NOT wait for AI anymore
    return lead;
  }

  async getAllLeads(filters: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ leads: ILead[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) {
      query['aiAnalysis.leadScore.category'] = filters.category;
    }

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
      { new: true }
    );
  }
}