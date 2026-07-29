import { describe, expect, it, vi } from "vitest";
import { PostgresSuggestionRepository } from "../src/repositories/suggestions.repository.js";

describe("PostgresSuggestionRepository", () => {
  it("busca por prefixo e ordena por popularidade e ordem alfabética", async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: "23",
          term: "danos morais",
          popularity: 110,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
    });
    const repository = new PostgresSuggestionRepository({ query } as never);

    const result = await repository.findByPrefix("acao", 20);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(
        "ORDER BY popularity DESC, lower(term) ASC, term ASC",
      ),
      ["acao%", 20],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("lower(public.immutable_unaccent(term)) LIKE $1"),
      expect.any(Array),
    );
    expect(result).toEqual([
      {
        id: 23,
        term: "danos morais",
        popularity: 110,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("escapa curingas de LIKE presentes no termo", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresSuggestionRepository({ query } as never);

    await repository.findByPrefix("100%_legal", 10);

    expect(query).toHaveBeenCalledWith(expect.any(String), [
      "100\\%\\_legal%",
      10,
    ]);
  });
});
