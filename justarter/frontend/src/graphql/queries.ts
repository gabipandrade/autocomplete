import { gql } from "@apollo/client";

export const GET_SUGGESTIONS = gql`
  query Suggestions($query: String!, $limit: Int = 20) {
    suggestions(query: $query, limit: $limit) {
      id
      term
      popularity
      createdAt
    }
  }
`;
