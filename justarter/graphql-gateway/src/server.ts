import { ApolloServer } from "@apollo/server";
import {
  backendAPI,
  type BackendAPI,
} from "./backendClient.js";
import { createResolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

export function buildApolloServer(client: BackendAPI = backendAPI) {
  return new ApolloServer({
    typeDefs,
    resolvers: createResolvers(client),
  });
}
