import { z } from 'zod';
import { LeadAnalysisOutput } from '../../../types/ai.types';
import { PROMPT_VERSION } from '../prompts/leadAnalysis.prompt';

/**
 * ZOD SCHEMA — The safety net between Gemini and your database
 *
 * Professor Note:
 * Every field here is intentional. Notice we don't just check types,
 * we enforce business rules:
 *   - score must be between 0 and 100 (min/max)
 *   - reasoning must be at least 10 chars (not an empty string)
 *   - followUpDays between 1 and 90 (business constraint)
 *
 * This is the difference between "is it JSON" and "is it valid business data".
 * Always validate business rules, not just data types.
 */
export const leadAnalysisOutputSchema = z.object({
  leadScore: z.object({
    score: z
      .number()
      .min(0, 'Score cannot be negative')
      .max(100, 'Score cannot exceed 100'),
    category: z.enum(['hot', 'warm', 'cold']),
    reasoning: z.string().min(10, 'Reasoning too short to be meaningful'),
    confidenceLevel: z.enum(['high', 'medium', 'low']),
  }),

  identifiedPainPoint: z
    .string()
    .min(5, 'Pain point too short'),

  outreach: z.object({
   firstEmail: z.object({
  subject: z.string().min(5, 'Email subject too short'),
  body: z.string().min(20, 'Email body is missing or too short').max(1500, 'Email body exceeds limit'),
  wordCount: z.number().positive('Word count must be positive'),
}),
    linkedinMessage: z
      .string()
      .max(600, 'LinkedIn message too long'),
    followUpAction: z
      .string()
      .min(5, 'Follow-up action too short'),
    followUpDays: z
      .number()
      .min(1, 'Follow-up must be at least 1 day')
      .max(90, 'Follow-up cannot exceed 90 days'),
  }),

  crmNote: z.string().min(10, 'CRM note too short'),
  missingInformation: z.array(z.string()),
  responsibleAICaution: z
    .string()
    .min(10, 'Responsible AI caution too short'),
});

/**
 * validateLeadAnalysisOutput
 *
 * Takes unknown raw data from Gemini and either:
 * a) Returns a fully typed, validated LeadAnalysisOutput
 * b) Throws with a clear error message
 *
 * The caller (Gemini provider) handles the error appropriately.
 * This function has one job: validate. Nothing else.
 */
export function validateLeadAnalysisOutput(raw: unknown): LeadAnalysisOutput {
  const result = leadAnalysisOutputSchema.safeParse(raw);

  if (!result.success) {
    // Log full details for debugging — but never send this to the client
    console.error('[AI Validator] Output validation failed:');
    console.error(JSON.stringify(result.error.flatten(), null, 2));
    throw new Error(
      `AI returned an invalid response structure. Check server logs for details.`
    );
  }

  // Attach metadata that the AI does not generate — we add it ourselves
  return {
    ...result.data,
    analysisVersion: PROMPT_VERSION,
  };
}