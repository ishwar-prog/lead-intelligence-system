import axios, { AxiosError } from "axios";
import {
  AIProvider,
  LeadAnalysisInput,
  LeadAnalysisOutput,
} from "../../../types/ai.types";
import { buildLeadAnalysisPrompt } from "../prompts/leadAnalysis.prompt";
import { validateLeadAnalysisOutput } from "../validators/leadAnalysis.validator";
import { env } from "../../../config/env";

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GeminiProvider implements AIProvider
 *
 * This class has ONE responsibility: communicate with Gemini's API
 * and return a validated LeadAnalysisOutput.
 *
 * It does NOT know what a lead is in business terms.
 * It does NOT know about MongoDB or Express.
 * It only knows how to call Gemini and validate the result.
 *
 * Professor Note — Why exponential backoff?
 * When Gemini rate limits you, hammering it with instant retries makes it worse.
 * Waiting 1 second, then 2 seconds between retries gives the API time to recover.
 * This pattern is called exponential backoff and is used everywhere in production.
 */
export class GeminiProvider implements AIProvider {
  private readonly apiUrl: string;
  private readonly model = "gemini-2.5-flash"; // was: 'gemini-1.5-flash'

  constructor() {
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async analyzeLead(input: LeadAnalysisInput): Promise<LeadAnalysisOutput> {
    const prompt = buildLeadAnalysisPrompt(input);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[Gemini] Attempt ${attempt}/${MAX_RETRIES} for company: ${input.company}`,
        );

        const response = await axios.post(
          `${this.apiUrl}?key=${env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              /**
               * Temperature: 0.2
               *
               * Range is 0.0 to 1.0
               * 0.0 = completely deterministic (same input → same output always)
               * 1.0 = very creative/random
               *
               * For lead scoring we want consistency, not creativity.
               * The same lead should score similarly on every call.
               * 0.2 gives slight variation while remaining focused.
               *
               * Use high temperature for creative writing tasks.
               * Use low temperature for analysis and structured data tasks.
               * Remember this rule forever.
               */
              temperature: 0.2,
              maxOutputTokens: 3072, // Hard cap — prevents runaway expensive responses
              topP: 0.8,
            },
          },
          {
            timeout: 30000, // 30 seconds — never wait forever for an AI response
            headers: { "Content-Type": "application/json" },
          },
        );

        // Navigate the Gemini response structure
        const rawText: string | undefined =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error("Gemini returned an empty response body");
        }

        // Gemini reports WHY it stopped generating in finishReason.
        // 'MAX_TOKENS' means it hit the maxOutputTokens ceiling mid-response -
        // this is the exact failure mode we just debugged. Catching it here
        // gives a precise error instead of a generic JSON parse failure.
        const finishReason = response.data?.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
          throw new Error(
            "Gemini response was truncated by maxOutputTokens limit. Increase the token limit or shorten the prompt output requirements.",
          );
        }

        /**
         * Clean the response
         *
         * Even when you tell Gemini to return raw JSON,
         * it sometimes wraps it in ```json ... ``` markdown blocks.
         * This is a known behavior. Always clean before parsing.
         * Never assume the AI follows instructions perfectly.
         */
        const cleanedText = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        // Parse JSON — wrap in try/catch for clear error message
        let parsed: unknown;
        try {
          parsed = JSON.parse(cleanedText);
        } catch {
          // Log a snippet of the bad response for debugging
          const preview = cleanedText.substring(0, 300);
          throw new Error(`Gemini returned invalid JSON. Preview: ${preview}`);
        }

        // Validate structure and business rules
        const validated = validateLeadAnalysisOutput(parsed);

        // Add token usage for cost tracking
        validated.tokensUsed = response.data?.usageMetadata?.totalTokenCount;

        console.log(
          `[Gemini] Success. Score: ${validated.leadScore.score}. Tokens: ${validated.tokensUsed ?? "unknown"}`,
        );

        return validated;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Do not retry validation failures — the problem is the prompt, not the network
        if (lastError.message.includes("invalid response structure")) {
          console.error("[Gemini] Validation failure — will not retry");
          throw lastError;
        }

        // Do not retry authentication failures — retrying will not fix a bad API key
        if (error instanceof AxiosError && error.response?.status === 401) {
          throw new Error(
            "Gemini API authentication failed. Check your GEMINI_API_KEY.",
          );
        }

        // Rate limit — wait longer before retrying
        if (error instanceof AxiosError && error.response?.status === 429) {
          console.warn("[Gemini] Rate limited. Waiting before retry...");
          await sleep(BASE_RETRY_DELAY_MS * attempt * 2); // Longer wait for rate limits
        } else if (attempt < MAX_RETRIES) {
          // Exponential backoff for other errors
          const delay = BASE_RETRY_DELAY_MS * attempt;
          console.warn(
            `[Gemini] Attempt ${attempt} failed. Retrying in ${delay}ms...`,
          );
          await sleep(delay);
        }
      }
    }

    throw lastError ?? new Error("All Gemini retry attempts failed");
  }
}
