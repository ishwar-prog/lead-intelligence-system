import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LeadService } from '../services/lead/lead.service';

/**
 * Input validation schema for creating a lead
 *
 * Professor Note:
 * This validates CLIENT input — completely separate from the AI output validator.
 * Two different validation jobs:
 * 1. This schema: "Is what the client sent us valid?"
 * 2. leadAnalysis.validator.ts: "Is what the AI returned valid?"
 *
 * Never skip either one.
 */
const createLeadSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().min(1, 'Industry is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    errorMap: () => ({ message: 'Invalid company size' }),
  }),
  painPoint: z
    .string()
    .min(10, 'Please describe the pain point in more detail')
    .max(1000),
  budgetSignal: z.string().default('Unknown'),
  timeline: z.string().default('Unknown'),
  leadSource: z.string().min(1, 'Lead source is required'),
});

const humanReviewSchema = z.object({
  humanReviewedBy: z.string().min(1, 'Reviewer name is required'),
  humanOverrideScore: z.number().min(0).max(100).optional(),
  humanNotes: z.string().max(2000).optional(),
});

const leadService = new LeadService();

/**
 * LeadController — HTTP layer only
 *
 * Every method follows the same pattern:
 * 1. Validate request input
 * 2. Call service method
 * 3. Send response
 * 4. Pass errors to next() — handled centrally in errorHandler middleware
 *
 * Notice: no business logic here. No AI calls. No database queries.
 * The controller is just the HTTP interface to your service.
 */
export class LeadController {

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createLeadSchema.parse(req.body);
    const lead = await leadService.createAndAnalyzeLead(validated);

    // Status 202 Accepted = "request received, processing not yet complete"
    // This is the correct HTTP status for async work, not 201 Created alone
    res.status(202).json({
      success: true,
      data: lead,
      message: 'Lead received and queued for AI analysis. Poll GET /api/leads/:id for results.',
    });
  } catch (error) {
    next(error);
  }
}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, category, page, limit } = req.query;

      const result = await leadService.getAllLeads({
        status: status as string | undefined,
        category: category as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadService.getLeadById(req.params.id);

      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found' });
        return;
      }

      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async humanReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = humanReviewSchema.parse(req.body);
      const lead = await leadService.humanReviewLead(req.params.id, validated);

      if (!lead) {
        res.status(404).json({ success: false, message: 'Lead not found' });
        return;
      }

      res.json({
        success: true,
        data: lead,
        message: 'Human review recorded successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}