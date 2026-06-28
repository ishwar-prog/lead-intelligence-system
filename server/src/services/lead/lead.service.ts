import { Lead, ILead } from '../../models/lead.model';
import { LeadAnalysisInput } from '../../types/ai.types';
import { enqueueLeadAnalysis } from '../../queues/leadAnalysis.queue';

export class LeadService {
  async createAndAnalyzeLead(userId: string, input: LeadAnalysisInput): Promise<ILead> {
    const lead = new Lead({ ...input, userId, status: 'pending' });
    await lead.save();
    await enqueueLeadAnalysis({ leadId: lead.id, input });
    return lead;
  }

  async getAllLeads(
    userId: string,
    filters: { status?: string; category?: string; page?: number; limit?: number }
  ) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    // userId and deletedAt: null are ALWAYS present, on every query,
    // regardless of what other filters get added. This isn't optional.
    const query: Record<string, unknown> = { userId, deletedAt: null };
    if (filters.status) query.status = filters.status;
    if (filters.category) query['aiAnalysis.leadScore.category'] = filters.category;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    return { leads, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Professor Note — this single line is the most important security
   * fix in this entire phase, and it's worth naming the vulnerability
   * class explicitly: this is called an IDOR (Insecure Direct Object
   * Reference) vulnerability when it's missing.
   *
   * The WRONG way to write this:
   *   const lead = await Lead.findById(id);
   *   if (lead.userId !== userId) return res.status(403)...
   *
   * That fetches ANY user's lead first, then checks ownership in
   * application code AFTER the fact. It's easy to forget that check on
   * one route, and the moment you do, any logged-in user can read or
   * modify ANY other user's data just by guessing/iterating IDs.
   *
   * The RIGHT way - what we're doing here - bakes ownership directly
   * into the database query itself. If the lead doesn't belong to this
   * user, the query returns null, full stop. There's no separate check
   * to forget, because there's no code path where ownership isn't
   * already enforced by the query's own filter.
   */
  async getLeadById(userId: string, id: string): Promise<ILead | null> {
    return Lead.findOne({ _id: id, userId, deletedAt: null });
  }

  async humanReviewLead(
    userId: string,
    id: string,
    reviewData: { humanReviewedBy: string; humanOverrideScore?: number; humanNotes?: string }
  ): Promise<ILead | null> {
    return Lead.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { humanReviewed: true, humanReviewedAt: new Date(), ...reviewData },
      { new: true }
    );
  }

  async softDeleteLead(userId: string, id: string): Promise<ILead | null> {
    return Lead.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  async getAllDeletedLeads(
    userId: string,
    filters: { page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const query = { userId, deletedAt: { $ne: null } };

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ deletedAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    return { leads, total, page, totalPages: Math.ceil(total / limit) };
  }

  async restoreLead(userId: string, id: string): Promise<ILead | null> {
    return Lead.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );
  }

  async permanentlyDeleteLead(userId: string, id: string): Promise<ILead | null> {
    return Lead.findOneAndDelete({ _id: id, userId, deletedAt: { $ne: null } });
  }

  async restoreAllLeads(userId: string) {
    return Lead.updateMany(
      { userId, deletedAt: { $ne: null } },
      { deletedAt: null }
    );
  }

  async permanentlyDeleteAllLeads(userId: string) {
    return Lead.deleteMany({ userId, deletedAt: { $ne: null } });
  }
}