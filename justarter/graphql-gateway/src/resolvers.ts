import {
  backendAPI,
  type BackendAPI,
} from "./backendClient.js";

const MIN_SEARCH_LENGTH = 4;
const MAX_SUGGESTIONS = 20;

interface SuggestionsArgs {
  query: string;
  limit?: number;
}

interface SuggestionByIdArgs {
  id: string;
}

interface CreateSuggestionArgs {
  term: string;
}

function normalizeQuery(query: string): string {
  return query
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("pt-BR");
}

function normalizeLimit(limit = MAX_SUGGESTIONS): number {
  if (!Number.isInteger(limit)) {
    return MAX_SUGGESTIONS;
  }

  return Math.min(Math.max(limit, 1), MAX_SUGGESTIONS);
}

export function createResolvers(client: BackendAPI) {
  return {
    Query: {
      async suggestions(_: unknown, args: SuggestionsArgs) {
        const query = normalizeQuery(args.query);

        if ([...query].length < MIN_SEARCH_LENGTH) {
          return [];
        }

        try {
          return await client.getSuggestions(query, normalizeLimit(args.limit));
        } catch {
          return [];
        }
      },

      async suggestionById(_: unknown, args: SuggestionByIdArgs) {
        const id = Number(args.id);

        if (!Number.isSafeInteger(id) || id < 1) {
          return null;
        }

        return client.getSuggestionById(id);
      },
    },

    Mutation: {
      async createSuggestion(_: unknown, args: CreateSuggestionArgs) {
        const term = normalizeQuery(args.term);

        if ([...term].length < MIN_SEARCH_LENGTH) {
          return null;
        }

        return client.createSuggestion(term);
      },
    },
  };
}

export const resolvers = createResolvers(backendAPI);
