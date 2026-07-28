import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool, { closePool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const seedFile = path.resolve(__dirname, "..", "db", "seed.sql");
  const sql = await fs.readFile(seedFile, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Seed aplicado com sucesso");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(closePool);
