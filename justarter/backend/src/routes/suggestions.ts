import type { FastifyPluginAsync } from "fastify";
import type { SuggestionSearchService } from "../services/suggestions.service.js";
import { MAX_SUGGESTIONS } from "../services/suggestions.service.js";

interface SearchQuery {
  q: string;
  limit?: number;
}

interface SuggestionRoutesOptions {
  service: SuggestionSearchService;
}

const querySchema = {
  type: "object",
  additionalProperties: false,
  required: ["q"],
  properties: {
    q: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: MAX_SUGGESTIONS,
      default: MAX_SUGGESTIONS,
    },
  },
} as const;

const responseSchema = {
  type: "array",
  maxItems: MAX_SUGGESTIONS,
  items: {
    type: "object",
    required: ["id", "term", "popularity", "createdAt"],
    properties: {
      id: { type: "integer" },
      term: { type: "string" },
      popularity: { type: "integer" },
      createdAt: { type: "string" },
    },
  },
} as const;

const suggestionRoutes: FastifyPluginAsync<SuggestionRoutesOptions> = async (
  app,
  { service },
) => {
  app.get<{ Querystring: SearchQuery }>(
    "/suggestions",
    {
      schema: {
        querystring: querySchema,
        response: {
          200: responseSchema,
        },
      },
    },
    async (request) => service.search(request.query.q, request.query.limit),
  );
};

export default suggestionRoutes;
