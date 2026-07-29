import { afterEach, describe, expect, it, vi } from "vitest";
import type { BackendAPI } from "../src/backendClient.js";
import { buildApolloServer } from "../src/server.js";

const servers: ReturnType<typeof buildApolloServer>[] = [];

function createBackendMock(): BackendAPI {
  return {
    getSuggestions: vi.fn().mockResolvedValue([
      {
        id: 23,
        term: "danos morais",
        popularity: 110,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]),
    getSuggestionById: vi.fn().mockResolvedValue(null),
    createSuggestion: vi.fn().mockResolvedValue(null),
  };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.stop()));
});

describe("suggestions query", () => {
  it("executa a query completa com query e limit", async () => {
    const backend = createBackendMock();
    const server = buildApolloServer(backend);
    servers.push(server);

    const response = await server.executeOperation({
      query: `
        query Suggestions($query: String!, $limit: Int) {
          suggestions(query: $query, limit: $limit) {
            id
            term
            popularity
            createdAt
          }
        }
      `,
      variables: {
        query: "danos",
        limit: 10,
      },
    });

    expect(response.body.kind).toBe("single");
    if (response.body.kind === "single") {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.suggestions).toEqual([
        {
          id: "23",
          term: "danos morais",
          popularity: 110,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]);
    }
    expect(backend.getSuggestions).toHaveBeenCalledWith("danos", 10);
  });

  it("usa o limite padrão de 20", async () => {
    const backend = createBackendMock();
    const server = buildApolloServer(backend);
    servers.push(server);

    await server.executeOperation({
      query: `
        query {
          suggestions(query: "danos") {
            id
          }
        }
      `,
    });

    expect(backend.getSuggestions).toHaveBeenCalledWith("danos", 20);
  });
});
