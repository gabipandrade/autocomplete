import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import type { SuggestionSearchService } from "../src/services/suggestions.service.js";

const apps: ReturnType<typeof buildApp>[] = [];

function createServiceMock(): SuggestionSearchService {
  return {
    search: vi.fn().mockResolvedValue([]),
  };
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("Backend routes", () => {
  it("retorna o healthcheck", async () => {
    const app = buildApp({ suggestionService: createServiceMock() });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("retorna sugestões em GET /suggestions", async () => {
    const service = createServiceMock();
    vi.mocked(service.search).mockResolvedValue([
      {
        id: 23,
        term: "danos morais",
        popularity: 110,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    const app = buildApp({ suggestionService: service });
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/suggestions?q=DANOS&limit=10",
    });

    expect(response.statusCode).toBe(200);
    expect(service.search).toHaveBeenCalledWith("DANOS", 10);
    expect(response.json()).toHaveLength(1);
  });

  it("mantém a rota usada atualmente pelo gateway", async () => {
    const service = createServiceMock();
    const app = buildApp({ suggestionService: service });
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/suggestions?q=danos",
    });

    expect(response.statusCode).toBe(200);
    expect(service.search).toHaveBeenCalledWith("danos", 20);
  });

  it("rejeita parâmetros ausentes ou inválidos", async () => {
    const app = buildApp({ suggestionService: createServiceMock() });
    apps.push(app);

    const withoutQuery = await app.inject({
      method: "GET",
      url: "/suggestions",
    });
    const excessiveLimit = await app.inject({
      method: "GET",
      url: "/suggestions?q=danos&limit=21",
    });

    expect(withoutQuery.statusCode).toBe(400);
    expect(excessiveLimit.statusCode).toBe(400);
  });

  it("retorna uma mensagem segura quando ocorre um erro inesperado", async () => {
    const service = createServiceMock();
    vi.mocked(service.search).mockRejectedValue(
      new Error("database connection failed"),
    );
    const app = buildApp({ suggestionService: service });
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/suggestions?q=danos",
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: "Internal server error" });
  });
});
