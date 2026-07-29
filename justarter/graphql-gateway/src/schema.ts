export const typeDefs = `#graphql
  type Suggestion {
    id: ID!
    term: String!
    popularity: Int!
    createdAt: String!
  }

  type Query {
    suggestions(query: String!, limit: Int = 20): [Suggestion!]!
    suggestionById(id: ID!): Suggestion
  }

  type Mutation {
    createSuggestion(term: String!): Suggestion
  }
`;
