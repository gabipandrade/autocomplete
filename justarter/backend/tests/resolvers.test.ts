import { describe, expect, it } from "vitest";
import { buildSuggestionSql, normalizeSearchTerm, shouldSearch } from "../src/resolvers.js";

describe("resolvers", () => {
  it("normaliza termos e aplica a regra dos 4 caracteres", () => {
    expect(normalizeSearchTerm("  React  ")).toBe("react");
    expect(shouldSearch("abc")).toBe(false);
    expect(shouldSearch("react")).toBe(true);
  });

  it("monta um SQL básico para buscas válidas", () => {
    const result = buildSuggestionSql("react");

    expect(result.sql).toContain("LIKE");
    expect(result.params).toEqual(["react%"]);
  });
});
