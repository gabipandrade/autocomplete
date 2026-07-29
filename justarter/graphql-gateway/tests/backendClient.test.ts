import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  HttpBackendClient,
  parseBackendTimeout,
} from "../src/backendClient.js";

function createHttpMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
  };
}

const logger = {
  error: vi.fn(),
};

describe("HttpBackendClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia termo e limite para a rota de sugestões", async () => {
    const http = createHttpMock();
    const suggestions = [
      {
        id: 23,
        term: "danos morais",
        popularity: 110,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    http.get.mockResolvedValue({ data: suggestions });
    const client = new HttpBackendClient(http as never, logger);

    await expect(client.getSuggestions("danos", 10)).resolves.toEqual(
      suggestions,
    );
    expect(http.get).toHaveBeenCalledWith("/suggestions", {
      params: { q: "danos", limit: 10 },
    });
  });

  it("retorna lista vazia quando o backend falha", async () => {
    const http = createHttpMock();
    http.get.mockRejectedValue(new Error("timeout"));
    const client = new HttpBackendClient(http as never, logger);

    await expect(client.getSuggestions("danos", 20)).resolves.toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to fetch suggestions from backend: timeout",
    );
  });

  it("mantém as chamadas por ID e de criação", async () => {
    const http = createHttpMock();
    const suggestion = {
      id: 1,
      term: "teste jurídico",
      popularity: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    http.get.mockResolvedValue({ data: suggestion });
    http.post.mockResolvedValue({ data: suggestion });
    const client = new HttpBackendClient(http as never, logger);

    await expect(client.getSuggestionById(1)).resolves.toEqual(suggestion);
    await expect(client.createSuggestion("teste jurídico")).resolves.toEqual(
      suggestion,
    );
    expect(http.get).toHaveBeenCalledWith("/suggestions/1");
    expect(http.post).toHaveBeenCalledWith("/suggestions", {
      term: "teste jurídico",
    });
  });

  it("usa 2 segundos quando o timeout não é válido", () => {
    expect(parseBackendTimeout(undefined)).toBe(2_000);
    expect(parseBackendTimeout("invalid")).toBe(2_000);
    expect(parseBackendTimeout("-1")).toBe(2_000);
    expect(parseBackendTimeout("3500")).toBe(3_500);
  });
});
