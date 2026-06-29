import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { LeadService } from "../services/lead/lead.service";
import { AuthenticatedRequest } from "../middleware/requireAuth";
import { LeadExtractionService } from "../services/lead/leadExtraction.service";

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
  company: z.string().min(1, "Company name is required").max(200),
  industry: z.string().min(1, "Industry is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"], {
    message: "Invalid company size",
  }),
  painPoint: z
    .string()
    .min(10, "Please describe the pain point in more detail")
    .max(1000),
  budgetSignal: z.string().default("Unknown"),
  timeline: z.string().default("Unknown"),
  leadSource: z.string().min(1, "Lead source is required"),
});

const humanReviewSchema = z.object({
  humanReviewedBy: z.string().min(1, "Reviewer name is required"),
  humanOverrideScore: z.number().min(0).max(100).optional(),
  humanNotes: z.string().max(2000).optional(),
});

const leadService = new LeadService();
const leadExtractionService = new LeadExtractionService();

const extractionInputSchema = z.object({
  rawText: z
    .string()
    .trim()
    .min(20, "Please paste more detail - at least 20 characters")
    .max(
      4000,
      "Pasted text is too long - please trim it to the relevant section",
    ),
});

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
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = createLeadSchema.parse(req.body);
      const lead = await leadService.createAndAnalyzeLead(
        req.userId!,
        validated,
      );
      res
        .status(202)
        .json({
          success: true,
          data: lead,
          message: "Lead created and queued for analysis",
        });
    } catch (error) {
      next(error);
    }
  }

  async extract(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { rawText } = extractionInputSchema.parse(req.body);
      const extracted = await leadExtractionService.extract(rawText);
      res.json({ success: true, data: extracted });
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { status, category, page, limit } = req.query;
      const result = await leadService.getAllLeads(req.userId!, {
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

  async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const lead = await leadService.getLeadById(
        req.userId!,
        req.params.id as string,
      );
      if (!lead) {
        res.status(404).json({ success: false, message: "Lead not found" });
        return;
      }
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async humanReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = humanReviewSchema.parse(req.body);
      const lead = await leadService.humanReviewLead(
        req.userId!,
        req.params.id as string,
        validated,
      );
      if (!lead) {
        res.status(404).json({ success: false, message: "Lead not found" });
        return;
      }
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const lead = await leadService.softDeleteLead(
        req.userId!,
        req.params.id as string,
      );
      if (!lead) {
        res.status(404).json({ success: false, message: "Lead not found" });
        return;
      }
      res.json({ success: true, message: "Lead removed" });
    } catch (error) {
      next(error);
    }
  }

  async getAllDeleted(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page =
        typeof req.query.page === "string" ? Number(req.query.page) : undefined;

      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : undefined;

      const result = await leadService.getAllDeletedLeads(req.userId!, {
        page:
          page !== undefined && Number.isFinite(page) && page > 0
            ? page
            : undefined,

        limit:
          limit !== undefined && Number.isFinite(limit) && limit > 0
            ? limit
            : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async restore(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const lead = await leadService.restoreLead(
        req.userId!,
        req.params.id as string,
      );
      if (!lead) {
        res
          .status(404)
          .json({ success: false, message: "Lead not found or not deleted" });
        return;
      }
      res.json({ success: true, data: lead, message: "Lead restored" });
    } catch (error) {
      next(error);
    }
  }

  async permanentlyDelete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const lead = await leadService.permanentlyDeleteLead(
        req.userId!,
        req.params.id as string,
      );
      if (!lead) {
        res
          .status(404)
          .json({ success: false, message: "Lead not found or not deleted" });
        return;
      }
      res.json({ success: true, message: "Lead permanently deleted" });
    } catch (error) {
      next(error);
    }
  }

  async restoreAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await leadService.restoreAllLeads(req.userId!);
      res.json({ success: true, message: "All removed leads restored" });
    } catch (error) {
      next(error);
    }
  }

  async permanentlyDeleteAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await leadService.permanentlyDeleteAllLeads(req.userId!);
      res.json({
        success: true,
        message: "All removed leads permanently deleted",
      });
    } catch (error) {
      next(error);
    }
  }
}
