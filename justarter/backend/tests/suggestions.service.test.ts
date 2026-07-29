import { describe, expect, it, vi } from "vitest";
import type { SuggestionRepository } from "../src/repositories/suggestions.repository.js";
import {
  MAX_SUGGESTIONS,
  SuggestionsService,
  normalizeSearchTerm,
} from "../src/services/suggestions.service.js";

function createRepositoryMock(): SuggestionRepository {
  return {
    findByPrefix: vi.fn().mockResolvedValue([]),
  };
}

describe("SuggestionsService", () => {
  it("normaliza espaços, letras maiúsculas e caracteres Unicode", () => {
    expect(normalizeSearchTerm("  AÇÃO   Civil  ")).toBe("ação civil");
  });

  it("não consulta o repository quando o termo tem menos de 4 caracteres", async () => {
    const repository = createRepositoryMock();
    const service = new SuggestionsService(repository);

    await expect(service.search(" aç ")).resolves.toEqual([]);
    expect(repository.findByPrefix).not.toHaveBeenCalled();
  });

  it("consulta o repository com o termo normalizado", async () => {
    const repository = createRepositoryMock();
    const service = new SuggestionsService(repository);

    await service.search("  DANOS  ");

    expect(repository.findByPrefix).toHaveBeenCalledWith(
      "danos",
      MAX_SUGGESTIONS,
    );
  });

  it("limita a busca a no máximo 20 resultados", async () => {
    const repository = createRepositoryMock();
    const service = new SuggestionsService(repository);

    await service.search("danos", 100);

    expect(repository.findByPrefix).toHaveBeenCalledWith(
      "danos",
      MAX_SUGGESTIONS,
    );
  });
});
