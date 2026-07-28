import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PGPORT ?? 5432);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PGPORT deve ser um número inteiro entre 1 e 65535");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : (process.env.PGHOST ?? "localhost"),
  port: process.env.DATABASE_URL ? undefined : port,
  user: process.env.DATABASE_URL ? undefined : (process.env.PGUSER ?? "postgres"),
  password: process.env.DATABASE_URL ? undefined : (process.env.PGPASSWORD ?? "postgres"),
  database: process.env.DATABASE_URL ? undefined : (process.env.PGDATABASE ?? "justarter"),
  max: Number(process.env.PGPOOL_MAX ?? 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30_000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 5_000),
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
export const closePool = () => pool.end();

export default pool;
