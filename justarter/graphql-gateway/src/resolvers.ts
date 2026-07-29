import { backendAPI } from "./backendClient.js";

interface Suggestion {
  id: number;
  term: string;
  popularity: number;
  createdAt: string;
}

interface QueryArgs {
  q: string;
}

interface SuggestionByIdArgs {
  id: number;
}

interface CreateSuggestionArgs {
  term: string;
}

export const resolvers = {
  Query: {
    async suggestions(
      _: unknown,
      args: QueryArgs
    ): Promise<Suggestion[]> {
      if (!args.q || args.q.length < 4) {
        return [];
      }
      return backendAPI.getSuggestions(args.q);
    },

    async suggestionById(
      _: unknown,
      args: SuggestionByIdArgs
    ): Promise<Suggestion | null> {
      return backendAPI.getSuggestionById(args.id);
    },
  },

  Mutation: {
    async createSuggestion(
      _: unknown,
      args: CreateSuggestionArgs
    ): Promise<Suggestion | null> {
      if (!args.term || args.term.length < 4) {
        throw new Error("Term must be at least 4 characters long");
      }
      return backendAPI.createSuggestion(args.term);
    },
  },
};
