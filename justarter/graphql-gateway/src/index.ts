import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

const PORT = process.env.PORT ?? 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await server.listen({ port: PORT });

console.log(`🚀 GraphQL Gateway running at ${url}`);
