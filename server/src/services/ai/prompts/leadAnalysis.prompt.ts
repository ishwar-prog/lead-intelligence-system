import { LeadAnalysisInput } from '../../../types/ai.types';

/**
 * PROMPT VERSIONING — Why this matters
 *
 * Imagine you improve this prompt next month and leads start scoring differently.
 * Without versioning, you cannot know which AI output came from which prompt.
 * With versioning, every document in MongoDB has analysisVersion: 'v1.0.0'
 * or 'v1.1.0'. You can compare, audit, and roll back.
 *
 * In production AI systems, prompt versioning is as important as code versioning.
 */
export const PROMPT_VERSION = 'v1.0.0';

export function buildLeadAnalysisPrompt(input: LeadAnalysisInput): string {
  /**
   * PROMPT ENGINEERING PRINCIPLES applied here:
   *
   * 1. Role assignment — "You are a senior B2B sales analyst"
   *    Gives the model a context frame. Improves specificity of output.
   *
   * 2. Constraint — "using ONLY the information provided"
   *    Prevents hallucination. Critical for business use.
   *
   * 3. Explicit scoring criteria — removes ambiguity
   *    The model knows exactly how to calculate the score.
   *
   * 4. Output format specification — "Return ONLY valid JSON. No markdown."
   *    Even with this instruction, Gemini sometimes adds ```json blocks.
   *    That is why we clean the response in the provider. Always defensive.
   *
   * 5. Word limits on output — "email under 120 words"
   *    Without limits, AI writes essays. Constraints produce usable output.
   */
  return `
You are a senior B2B sales intelligence analyst with 15 years of enterprise sales experience.

Analyze this lead using ONLY the information provided below.
Do not infer, assume, or add any detail not explicitly present in the input.
If information is missing, note it in the missingInformation field.

LEAD DETAILS:
- Company: ${input.company}
- Industry: ${input.industry}
- Role: ${input.role}
- Company Size: ${input.companySize}
- Pain Point Mentioned: ${input.painPoint}
- Budget Signal: ${input.budgetSignal}
- Timeline: ${input.timeline}
- Lead Source: ${input.leadSource}

SCORING RUBRIC (100 points total — be precise):
- Company matches target industry: 20 points
- Lead is decision-maker or strong influencer: 20 points
- Clear and specific pain point mentioned: 20 points
- Budget or timeline signal present: 20 points
- Company size fits typical buyer profile: 20 points

CATEGORY RULES:
- 80-100: hot
- 50-79: warm
- 0-49: cold

CONFIDENCE LEVEL RULES:
- high: 4-5 scoring factors are clearly present in the data
- medium: 2-3 scoring factors are present
- low: 0-1 scoring factors are clearly present

OUTPUT INSTRUCTIONS:
- First email body must be under 120 words. Be specific to their pain point.
- LinkedIn message must be under 50 words.
- CRM note should be 1-2 short sentences only, not a paragraph.
- reasoning must be 1-2 short sentences only. State which criteria were met, briefly. Do not restate the full input back.
- responsibleAICaution must be 1 sentence only.
- missingInformation must be a short list of 1-4 word phrases, not full sentences. Example: "decision timeline", "exact budget range".
- Be concise everywhere. Brevity is required, not optional.

CRITICAL: Return ONLY a valid JSON object matching the structure below.
No explanation. No preamble. No markdown code blocks. Raw JSON only.

{
  "leadScore": {
    "score": <number 0-100>,
    "category": <"hot" | "warm" | "cold">,
    "reasoning": <string — explain which criteria were met and which were not>,
    "confidenceLevel": <"high" | "medium" | "low">
  },
  "identifiedPainPoint": <string — restate the core problem in business terms>,
  "outreach": {
    "firstEmail": {
      "subject": <string — specific, not generic>,
      "body": <string — under 120 words, personalized>,
      "wordCount": <number>
    },
    "linkedinMessage": <string — under 50 words>,
    "followUpAction": <string — specific action for sales rep>,
    "followUpDays": <number — days until follow up>
  },
  "crmNote": <string — 2-3 sentences for sales team>,
  "missingInformation": [<string — each missing data point>],
  "responsibleAICaution": <string — what human must verify>
}
  `.trim();
}