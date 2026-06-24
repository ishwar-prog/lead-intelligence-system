import axios, { AxiosError } from "axios";
import {
  AIProvider,
  LeadAnalysisInput,
  LeadAnalysisOutput,
  LeadExtractor,
  LeadExtractionOutput,
} from "../../../types/ai.types";
import { buildLeadAnalysisPrompt } from "../prompts/leadAnalysis.prompt";
import { buildExtractionPrompt } from "../prompts/leadExtraction.prompt";
import { validateLeadAnalysisOutput } from "../validators/leadAnalysis.validator";
import { validateLeadExtractionOutput } from "../validators/leadExtraction.validator";
import { env } from "../../../config/env";
import { AppError } from "../../../errors/AppError";

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeGeminiError(error: unknown): Error {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 503) {
      return new AppError(
        503,
        "Gemini is temporarily unavailable. This is an upstream AI provider issue, not an internal server failure. Please try again shortly.",
        "AI_PROVIDER_UNAVAILABLE",
      );
    }

    if (status === 429) {
      return new AppError(
        429,
        "Gemini is rate limiting requests right now. Please wait a moment and try again.",
        "AI_PROVIDER_RATE_LIMITED",
      );
    }

    if (status === 401 || status === 403) {
      return new AppError(
        502,
        "The AI provider rejected the server credentials. Please check the Gemini API configuration.",
        "AI_PROVIDER_AUTH_FAILED",
      );
    }

    if (status && status >= 500) {
      return new AppError(
        502,
        "The AI provider returned an upstream server error. Please try again shortly.",
        "AI_PROVIDER_ERROR",
      );
    }
  }

  return error instanceof Error ? error : new Error(String(error));
}

/**
 * GeminiProvider implements BOTH AIProvider (scoring) and LeadExtractor
 * (field extraction). Both call the identical underlying API with
 * identical retry/parsing/validation mechanics - only the prompt, token
 * budget, and validator differ between them.
 *
 * Rather than duplicating the entire retry loop a second time, the
 * shared mechanics live once in callGeminiJSON. This is the "Rule of
 * Three": write logic once when you need it; the moment a SECOND use
 * case needs the same logic, extract the shared helper - not before.
 *
 * Every lesson from Phase 2 (deprecated models, token truncation,
 * validation gaps) is encoded in this one shared method, so both
 * callers benefit from those fixes automatically, forever.
 */
export class GeminiProvider implements AIProvider, LeadExtractor {
  private readonly apiUrl: string;
  private readonly model = "gemini-2.5-flash";

  constructor() {
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async analyzeLead(input: LeadAnalysisInput): Promise<LeadAnalysisOutput> {
    const prompt = buildLeadAnalysisPrompt(input);
    const { data, tokensUsed } = await this.callGeminiJSON(
      prompt,
      3072,
      validateLeadAnalysisOutput,
    );
    data.tokensUsed = tokensUsed;
    return data;
  }

  async extractLeadFields(rawText: string): Promise<LeadExtractionOutput> {
    const prompt = buildExtractionPrompt(rawText);
    // Extraction output is short and simple - 1024 tokens is generous
    // headroom without inviting an unnecessarily slow response.
    const { data } = await this.callGeminiJSON(
      prompt,
      1024,
      validateLeadExtractionOutput,
    );
    return data;
  }

  private async callGeminiJSON<T>(
    prompt: string,
    maxOutputTokens: number,
    validate: (raw: unknown) => T,
  ): Promise<{ data: T; tokensUsed?: number }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          `${this.apiUrl}?key=${env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens, topP: 0.8 },
          },
          { timeout: 30000, headers: { "Content-Type": "application/json" } },
        );

        const rawText: string | undefined =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error("Gemini returned an empty response body");
        }

        const finishReason = response.data?.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
          throw new Error(
            "Gemini response was truncated by maxOutputTokens limit. Increase the token limit or shorten the prompt output requirements.",
          );
        }

        const cleanedText = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        let parsed: unknown;
        try {
          parsed = JSON.parse(cleanedText);
        } catch {
         throw new Error(
            "Gemini returned invalid JSON.",
          );
        }

        const data = validate(parsed);
        console.log(
          `[Gemini] Success. Tokens used: ${response.data?.usageMetadata?.totalTokenCount ?? "unknown"}`,
        );
        return {
          data,
          tokensUsed: response.data?.usageMetadata?.totalTokenCount,
        };
      } catch (error) {
        lastError = normalizeGeminiError(error);

        if (
          lastError.message.includes("invalid response structure") ||
          lastError.message.includes("invalid extraction structure")
        ) {
          console.error("[Gemini] Validation failure - will not retry");
          throw lastError;
        }

        if (
          lastError instanceof AppError &&
          lastError.code === "AI_PROVIDER_AUTH_FAILED"
        ) {
          throw lastError;
        }

        if (error instanceof AxiosError && error.response?.status === 429) {
          if (attempt < MAX_RETRIES) {
            console.warn("[Gemini] Rate limited. Waiting before retry...");
            await sleep(BASE_RETRY_DELAY_MS * attempt * 2);
          }
        } else if (error instanceof AxiosError && error.response?.status === 503) {
           if (attempt < MAX_RETRIES) {
           // 503 = Google's infrastructure is temporarily overloaded, not our fault
            // and not our rate limit. This tends to clear within a few seconds, so
            // it's worth waiting longer than a generic failure before retrying.
            console.warn("[Gemini] Service temporarily unavailable (503). Waiting before retry...");
            await sleep(BASE_RETRY_DELAY_MS * attempt * 3);
          }
        } else if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * attempt;
          console.warn(`[Gemini] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    throw lastError ?? new Error("All Gemini retry attempts failed");
  }
}
