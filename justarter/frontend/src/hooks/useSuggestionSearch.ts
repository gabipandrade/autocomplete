import { useApolloClient } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { GET_SUGGESTIONS } from "../graphql/queries";

export const MIN_SEARCH_LENGTH = 4;
export const MAX_SUGGESTIONS = 20;
export const DEFAULT_DEBOUNCE_MS = 250;

export interface Suggestion {
  id: string;
  term: string;
  popularity: number;
  createdAt: string;
}

interface SuggestionsData {
  suggestions: Suggestion[];
}

interface SuggestionsVariables {
  query: string;
  limit: number;
}

interface SuggestionSearchState {
  suggestions: Suggestion[];
  loading: boolean;
  hasError: boolean;
}

export function normalizeSearchTerm(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function useSuggestionSearch(
  value: string,
  enabled: boolean,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): SuggestionSearchState {
  const client = useApolloClient();
  const requestSequence = useRef(0);
  const [state, setState] = useState<SuggestionSearchState>({
    suggestions: [],
    loading: false,
    hasError: false,
  });

  useEffect(() => {
    const query = normalizeSearchTerm(value);
    const requestId = ++requestSequence.current;

    if (!enabled || [...query].length < MIN_SEARCH_LENGTH) {
      setState({ suggestions: [], loading: false, hasError: false });
      return;
    }

    setState({ suggestions: [], loading: false, hasError: false });

    const timer = window.setTimeout(async () => {
      if (requestId !== requestSequence.current) {
        return;
      }

      setState({ suggestions: [], loading: true, hasError: false });

      try {
        const { data } = await client.query<SuggestionsData, SuggestionsVariables>({
          query: GET_SUGGESTIONS,
          variables: { query, limit: MAX_SUGGESTIONS },
          fetchPolicy: "network-only",
        });

        if (requestId === requestSequence.current) {
          setState({
            suggestions: data.suggestions.slice(0, MAX_SUGGESTIONS),
            loading: false,
            hasError: false,
          });
        }
      } catch {
        if (requestId === requestSequence.current) {
          setState({ suggestions: [], loading: false, hasError: true });
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);

      if (requestId === requestSequence.current) {
        requestSequence.current += 1;
      }
    };
  }, [client, debounceMs, enabled, value]);

  return state;
}
