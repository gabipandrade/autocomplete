import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlFile(filePath: string) {
  const sql = await fs.readFile(filePath, "utf8");
  await query(sql);
}

async function main() {
  const migrationDir = path.resolve(__dirname, "..", "db", "migrations");
  const migrationFiles = (await fs.readdir(migrationDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    await runSqlFile(path.join(migrationDir, file));
  }

  const seedFile = path.resolve(__dirname, "..", "db", "seed.sql");
  try {
    await runSqlFile(seedFile);
  } catch (error) {
    console.warn("Seed não foi executado:", error);
  }

  console.log("Migrações aplicadas com sucesso");
}

main().catch((error) => {
  console.error("Erro ao rodar migrações", error);
  process.exitCode = 1;
});
