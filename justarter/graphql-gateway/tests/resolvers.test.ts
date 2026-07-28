import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolvers } from "../src/resolvers.js";
import * as backendClient from "../src/backendClient.js";

vi.mock("../src/backendClient.js");

describe("GraphQL Resolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query.suggestions", () => {
    it("should return empty array if query < 4 chars", async () => {
      const result = await resolvers.Query.suggestions(null, { q: "abc" });
      expect(result).toEqual([]);
    });

    it("should call backend API if query >= 4 chars", async () => {
      const mockSuggestions = [
        { id: 1, term: "test", count: 5, createdAt: "2024-01-01" },
      ];

      vi.spyOn(backendClient.backendAPI, "getSuggestions").mockResolvedValue(
        mockSuggestions
      );

      const result = await resolvers.Query.suggestions(null, { q: "test" });
      expect(result).toEqual(mockSuggestions);
    });
  });

  describe("Mutation.createSuggestion", () => {
    it("should throw error if term < 4 chars", async () => {
      await expect(
        resolvers.Mutation.createSuggestion(null, { term: "abc" })
      ).rejects.toThrow("Term must be at least 4 characters long");
    });

    it("should create suggestion if term >= 4 chars", async () => {
      const mockSuggestion = {
        id: 1,
        term: "test",
        count: 1,
        createdAt: "2024-01-01",
      };

      vi.spyOn(backendClient.backendAPI, "createSuggestion").mockResolvedValue(
        mockSuggestion
      );

      const result = await resolvers.Mutation.createSuggestion(null, {
        term: "test",
      });
      expect(result).toEqual(mockSuggestion);
    });
  });
});
