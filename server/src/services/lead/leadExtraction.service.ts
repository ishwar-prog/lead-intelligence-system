import { GeminiProvider } from '../ai/providers/gemini.provider';
import { LeadExtractionOutput } from '../../types/ai.types';

const aiProvider = new GeminiProvider();

export class LeadExtractionService {
  async extract(rawText: string): Promise<LeadExtractionOutput> {
    return aiProvider.extractLeadFields(rawText);
  }
}