import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/",
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
