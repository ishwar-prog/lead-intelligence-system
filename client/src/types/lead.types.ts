/**
 * MIRRORED TYPES — Read this before editing anything in this file
 *
 * These types intentionally mirror server/src/types/ai.types.ts and
 * server/src/models/lead.model.ts. They are NOT automatically synced.
 *
 * If you change a field shape on the backend (e.g. add a new field to
 * LeadAnalysisOutput), you MUST manually update this file too, or the
 * frontend will silently have a stale/wrong shape and TypeScript won't
 * catch the mismatch (since the data is crossing a network boundary,
 * not a function call).
 *
 * In a larger team/codebase, this duplication is normally solved with
 * a shared types package (npm workspace). For this project's scale,
 * manual mirroring with this comment as a permanent reminder is the
 * pragmatic choice.
 */

export type LeadStatus = 'pending' | 'analyzed' | 'failed';
export type LeadCategory = 'hot' | 'warm' | 'cold';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

export interface LeadExtractionResult {
  company: string | null;
  industry: string | null;
  role: string | null;
  companySize: CompanySize | null;
  painPoint: string | null;
  budgetSignal: string | null;
  timeline: string | null;
  leadSource: string | null;
  extractionConfidence: 'high' | 'medium' | 'low';
  fieldsNotFound: string[];
}

export interface LeadScore {
  score: number;
  category: LeadCategory;
  reasoning: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface OutreachContent {
  firstEmail: {
    subject: string;
    body: string;
    wordCount: number;
  };
  linkedinMessage: string;
  followUpAction: string;
  followUpDays: number;
}

export interface LeadAnalysis {
  leadScore: LeadScore;
  identifiedPainPoint: string;
  outreach: OutreachContent;
  crmNote: string;
  missingInformation: string[];
  responsibleAICaution: string;
  analysisVersion: string;
  tokensUsed?: number;
}

export interface Lead {
  id: string;
  company: string;
  industry: string;
  role: string;
  companySize: CompanySize;
  painPoint: string;
  budgetSignal: string;
  timeline: string;
  leadSource: string;
  aiAnalysis: LeadAnalysis | null;
  status: LeadStatus;
  failureReason?: string;
  humanReviewed: boolean;
  humanReviewedBy?: string;
  humanReviewedAt?: string;
  humanOverrideScore?: number;
  humanNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  company: string;
  industry: string;
  role: string;
  companySize: CompanySize;
  painPoint: string;
  budgetSignal?: string;
  timeline?: string;
  leadSource: string;
}

export interface HumanReviewInput {
  humanReviewedBy: string;
  humanOverrideScore?: number;
  humanNotes?: string;
}

/**
 * API response wrapper shapes — these match exactly what your
 * errorHandler.ts and controllers return. Keeping these aligned
 * means the api/ layer can be fully typed with no `any`.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[] | undefined>;
}

export interface PaginatedLeadsResponse {
  success: boolean;
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

