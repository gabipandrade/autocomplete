import type { Pool } from "pg";
import pool from "../db.js";
import type { Suggestion } from "../domain/suggestion.js";

interface SuggestionRow {
  id: string;
  term: string;
  popularity: number;
  createdAt: Date;
}

export interface SuggestionRepository {
  findByPrefix(term: string, limit: number): Promise<Suggestion[]>;
}

export class PostgresSuggestionRepository implements SuggestionRepository {
  constructor(private readonly database: Pick<Pool, "query"> = pool) {}

  async findByPrefix(term: string, limit: number): Promise<Suggestion[]> {
    const escapedTerm = term.replace(/[\\%_]/gu, "\\$&");
    const result = await this.database.query<SuggestionRow>(
      `SELECT id, term, popularity, created_at AS "createdAt"
       FROM suggestions
       WHERE lower(public.immutable_unaccent(term)) LIKE $1 ESCAPE '\\'
       ORDER BY popularity DESC, lower(term) ASC, term ASC
       LIMIT $2`,
      [`${escapedTerm}%`, limit],
    );

    return result.rows.map((row) => ({
      id: Number(row.id),
      term: row.term,
      popularity: row.popularity,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
