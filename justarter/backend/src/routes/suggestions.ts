import { Router, Request, Response } from "express";
import { query } from "../db.js";

const router = Router();

// GET /api/suggestions?q=term
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.length < 4) {
      return res.status(400).json({ error: "Query must be at least 4 characters" });
    }

    const result = await query(
      "SELECT id, term, count, created_at as createdAt FROM suggestions WHERE term ILIKE $1 LIMIT 20",
      [`${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GET /api/suggestions/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      "SELECT id, term, count, created_at as createdAt FROM suggestions WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    res.status(500).json({ error: "Failed to fetch suggestion" });
  }
});

// POST /api/suggestions
router.post("/", async (req: Request, res: Response) => {
  try {
    const { term } = req.body;

    if (!term || typeof term !== "string" || term.length < 4) {
      return res.status(400).json({ error: "Term must be at least 4 characters" });
    }

    const result = await query(
      `INSERT INTO suggestions (term, count, created_at) 
       VALUES ($1, 1, NOW()) 
       ON CONFLICT (term) DO UPDATE SET count = count + 1 
       RETURNING id, term, count, created_at as createdAt`,
      [term.toLowerCase()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating suggestion:", error);
    res.status(500).json({ error: "Failed to create suggestion" });
  }
});

export default router;
