export const EXTRACTION_PROMPT_VERSION = 'v1.0.0';

export function buildExtractionPrompt(rawText: string): string {
  const escapedRawText = JSON.stringify(rawText);
  return `
You are a data-entry assistant. Extract structured lead information from
the unstructured text below. It might be a copied email, a LinkedIn bio,
notes from a call, or anything else a salesperson pasted in.

RAW TEXT:
${escapedRawText}

Extract these fields. If a field is not clearly present, return null for
it. Never guess or invent a plausible-sounding value - null is the correct
answer when information is genuinely missing.

- company: the company name
- industry: the company's industry or sector
- role: the contact's job title
- companySize: exactly one of "1-10", "11-50", "51-200", "201-1000", "1000+" if inferable, otherwise null
- painPoint: the specific business problem mentioned
- budgetSignal: anything indicating budget availability or constraints
- timeline: anything indicating urgency or a target timeframe
- leadSource: where this lead came from, if mentioned

Return ONLY this JSON, no markdown, no explanation:
{
  "company": <string or null>,
  "industry": <string or null>,
  "role": <string or null>,
  "companySize": <one of the five exact size strings, or null>,
  "painPoint": <string or null>,
  "budgetSignal": <string or null>,
  "timeline": <string or null>,
  "leadSource": <string or null>,
  "extractionConfidence": <"high" | "medium" | "low">,
  "fieldsNotFound": [<string - name of each null field>]
}
  `.trim();
}