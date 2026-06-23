import { z } from 'zod';
import { LeadExtractionOutput } from '../../../types/ai.types';

const nullableFieldNameSchema = z.enum([
  'company',
  'industry',
  'role',
  'companySize',
  'painPoint',
  'budgetSignal',
  'timeline',
  'leadSource',
]);

export const leadExtractionOutputSchema = z.object({
  company: z.string().min(1).nullable(),
  industry: z.string().min(1).nullable(),
  role: z.string().min(1).nullable(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).nullable(),
  painPoint: z.string().min(1).nullable(),
  budgetSignal: z.string().trim().min(1).nullable(),
  timeline: z.string().trim().min(1).nullable(),
  leadSource: z.string().trim().min(1).nullable(),
  extractionConfidence: z.enum(['high', 'medium', 'low']),
  fieldsNotFound: z.array(nullableFieldNameSchema),
  }).superRefine((data, ctx) => {
  const expected = [
    'company',
    'industry',
    'role',
    'companySize',
    'painPoint',
    'budgetSignal',
    'timeline',
    'leadSource',
  ].filter((k) => (data as Record<string, unknown>)[k] === null);

  const actual = data.fieldsNotFound;
  if (expected.length !== actual.length || expected.some((k) => !actual.includes(k as any))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fieldsNotFound'],
      message: 'fieldsNotFound must exactly match the nullable fields',
    });
  }
});

export function validateLeadExtractionOutput(raw: unknown): LeadExtractionOutput {
  const result = leadExtractionOutputSchema.safeParse(raw);
  if (!result.success) {
    console.error('[Extraction Validator] failed:', result.error.flatten());
    throw new Error('AI returned an invalid extraction structure');
  }
  return result.data;
}