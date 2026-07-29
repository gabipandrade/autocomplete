import { describe, expect, it, vi } from "vitest";
import type { BackendAPI } from "../src/backendClient.js";
import { createResolvers } from "../src/resolvers.js";

function createBackendMock(): BackendAPI {
  return {
    getSuggestions: vi.fn().mockResolvedValue([]),
    getSuggestionById: vi.fn().mockResolvedValue(null),
    createSuggestion: vi.fn().mockResolvedValue(null),
  };
}

describe("GraphQL resolvers", () => {
  it("retorna lista vazia para termos com menos de 4 caracteres", async () => {
    const backend = createBackendMock();
    const resolvers = createResolvers(backend);

    await expect(
      resolvers.Query.suggestions(null, { query: " abc " }),
    ).resolves.toEqual([]);
    expect(backend.getSuggestions).not.toHaveBeenCalled();
  });

  it("normaliza o termo e limita o resultado a 20", async () => {
    const backend = createBackendMock();
    const resolvers = createResolvers(backend);

    await resolvers.Query.suggestions(null, {
      query: "  DANOS  ",
      limit: 50,
    });

    expect(backend.getSuggestions).toHaveBeenCalledWith("danos", 20);
  });

  it("retorna lista vazia quando o cliente lança um erro", async () => {
    const backend = createBackendMock();
    vi.mocked(backend.getSuggestions).mockRejectedValue(new Error("offline"));
    const resolvers = createResolvers(backend);

    await expect(
      resolvers.Query.suggestions(null, { query: "danos" }),
    ).resolves.toEqual([]);
  });

  it("mantém os resolvers de consulta por ID e criação", async () => {
    const backend = createBackendMock();
    const resolvers = createResolvers(backend);

    await resolvers.Query.suggestionById(null, { id: "10" });
    await resolvers.Mutation.createSuggestion(null, {
      term: "  TESTE Jurídico ",
    });

    expect(backend.getSuggestionById).toHaveBeenCalledWith(10);
    expect(backend.createSuggestion).toHaveBeenCalledWith("teste jurídico");
  });
});
