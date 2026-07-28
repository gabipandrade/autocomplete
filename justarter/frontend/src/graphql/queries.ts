import { gql } from "@apollo/client";

export const GET_SUGGESTIONS = gql`
  query Suggestions($term: String!) {
    suggestions(term: $term) {
      id
      term
      createdAt
    }
  }
`;
