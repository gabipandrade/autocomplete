import { buildApp } from "./app.js";
import { closePool } from "./db.js";

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT deve ser um número inteiro entre 1 e 65535");
}

const app = buildApp({ logger: true });

async function shutdown(signal: string) {
  app.log.info({ signal }, "Shutting down backend");
  await app.close();
  await closePool();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  await closePool();
  process.exitCode = 1;
}
