export const typeDefs = `
  type Suggestion {
    id: Int!
    term: String!
    count: Int!
    createdAt: String!
  }

  type Query {
    suggestions(q: String!): [Suggestion!]!
    suggestionById(id: Int!): Suggestion
  }

  type Mutation {
    createSuggestion(term: String!): Suggestion!
  }
`;
