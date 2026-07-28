import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool, { closePool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const migrationDir = path.resolve(__dirname, "..", "db", "migrations");
  const migrationFiles = (await fs.readdir(migrationDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const file of migrationFiles) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [file],
    );

    if (alreadyApplied.rowCount) {
      console.log(`Migration já aplicada: ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file],
      );
      await client.query("COMMIT");
      console.log(`Migration aplicada: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

main()
  .catch((error) => {
    console.error("Erro ao executar migrations:", error);
    process.exitCode = 1;
  })
  .finally(closePool);
