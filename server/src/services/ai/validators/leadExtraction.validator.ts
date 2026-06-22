import { z } from 'zod';
import { LeadExtractionOutput } from '../../../types/ai.types';

export const leadExtractionOutputSchema = z.object({
  company: z.string().min(1).nullable(),
  industry: z.string().min(1).nullable(),
  role: z.string().min(1).nullable(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).nullable(),
  painPoint: z.string().min(1).nullable(),
  budgetSignal: z.string().nullable(),
  timeline: z.string().nullable(),
  leadSource: z.string().nullable(),
  extractionConfidence: z.enum(['high', 'medium', 'low']),
  fieldsNotFound: z.array(z.string()),
});

export function validateLeadExtractionOutput(raw: unknown): LeadExtractionOutput {
  const result = leadExtractionOutputSchema.safeParse(raw);
  if (!result.success) {
    console.error('[Extraction Validator] failed:', result.error.flatten());
    throw new Error('AI returned an invalid extraction structure');
  }
  return result.data;
}