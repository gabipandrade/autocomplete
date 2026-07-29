import { startStandaloneServer } from "@apollo/server/standalone";
import { buildApolloServer } from "./server.js";

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT deve ser um número inteiro entre 1 e 65535");
}

const server = buildApolloServer();

const { url } = await startStandaloneServer(server, {
  listen: { port },
});

console.log(`🚀 GraphQL Gateway running at ${url}`);
