/**
 * TYPES FILE — The contract of our AI integration
 *
 * Professor Note:
 * Think of this file as the agreement between layers of your app.
 * The AI layer promises to return a LeadAnalysisOutput.
 * The lead service trusts that promise.
 * Zod enforces that promise at runtime.
 * TypeScript enforces it at compile time.
 * Three layers of safety for unpredictable AI output.
 */

export interface LeadAnalysisInput {
  company: string;
  industry: string;
  role: string;
  companySize: string;
  painPoint: string;
  budgetSignal: string;
  timeline: string;
  leadSource: string;
}

export interface LeadScore {
  score: number;                           // 0-100
  category: 'hot' | 'warm' | 'cold';
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

export interface LeadAnalysisOutput {
  leadScore: LeadScore;
  identifiedPainPoint: string;
  outreach: OutreachContent;
  crmNote: string;
  missingInformation: string[];
  responsibleAICaution: string;
  analysisVersion: string;  // Which prompt version produced this output
  tokensUsed?: number;      // Track AI costs over time
}

/**
 * AIProvider Interface — The Adapter Pattern
 *
 * Any class that implements this interface can be swapped in as the AI provider.
 * Your business logic calls this interface, not Gemini directly.
 * To switch from Gemini to Claude tomorrow:
 *   1. Create ClaudeProvider that implements AIProvider
 *   2. Change one line in lead.service.ts
 *   3. Everything else stays identical
 *
 * This is what "loosely coupled" architecture means in practice.
 */
export interface AIProvider {
  analyzeLead(input: LeadAnalysisInput): Promise<LeadAnalysisOutput>;
}