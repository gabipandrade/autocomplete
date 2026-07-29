import Fastify, {
  type FastifyError,
  type FastifyServerOptions,
} from "fastify";
import { PostgresSuggestionRepository } from "./repositories/suggestions.repository.js";
import healthRoutes from "./routes/health.js";
import suggestionRoutes from "./routes/suggestions.js";
import {
  SuggestionsService,
  type SuggestionSearchService,
} from "./services/suggestions.service.js";

interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  suggestionService?: SuggestionSearchService;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: options.logger ?? false });
  const suggestionService =
    options.suggestionService ??
    new SuggestionsService(new PostgresSuggestionRepository());

  app.register(healthRoutes);
  app.register(suggestionRoutes, { service: suggestionService });

  // Mantém compatibilidade com o gateway enquanto ele usa /api/suggestions.
  app.register(suggestionRoutes, {
    prefix: "/api",
    service: suggestionService,
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        error: "Invalid query parameters",
      });
    }

    request.log.error({ err: error }, "Unhandled request error");
    return reply.status(500).send({
      error: "Internal server error",
    });
  });

  return app;
}
