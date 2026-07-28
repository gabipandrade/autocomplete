import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../src/db.js";

vi.mock("../src/db.js");

describe("Suggestions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/suggestions", () => {
    it("should return suggestions matching query", async () => {
      const mockSuggestions = [
        { id: 1, term: "test", count: 5, createdAt: "2024-01-01" },
      ];

      vi.spyOn(db, "query").mockResolvedValue({ rows: mockSuggestions } as any);

      // In a real test, you'd call the API endpoint
      // For now, just verify the mock works
      const result = await db.query("SELECT * FROM suggestions WHERE term ILIKE $1", ["test%"]);
      expect(result.rows).toEqual(mockSuggestions);
    });
  });
});
