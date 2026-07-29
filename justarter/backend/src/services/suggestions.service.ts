import type { Suggestion } from "../domain/suggestion.js";
import type { SuggestionRepository } from "../repositories/suggestions.repository.js";

export const MIN_SEARCH_LENGTH = 4;
export const MAX_SUGGESTIONS = 20;

export function normalizeSearchTerm(term: string): string {
  return term
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("pt-BR");
}

export interface SuggestionSearchService {
  search(term: string, limit?: number): Promise<Suggestion[]>;
}

export class SuggestionsService implements SuggestionSearchService {
  constructor(private readonly repository: SuggestionRepository) {}

  async search(term: string, limit = MAX_SUGGESTIONS): Promise<Suggestion[]> {
    const normalizedTerm = normalizeSearchTerm(term);

    if ([...normalizedTerm].length < MIN_SEARCH_LENGTH) {
      return [];
    }

    const safeLimit = Math.min(
      Math.max(Number.isInteger(limit) ? limit : MAX_SUGGESTIONS, 1),
      MAX_SUGGESTIONS,
    );

    return this.repository.findByPrefix(normalizedTerm, safeLimit);
  }
}
