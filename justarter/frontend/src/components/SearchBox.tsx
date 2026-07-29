import { useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_DEBOUNCE_MS,
  MIN_SEARCH_LENGTH,
  normalizeSearchTerm,
  type Suggestion,
  useSuggestionSearch,
} from "../hooks/useSuggestionSearch";
import "./SearchBox.css";

interface SearchBoxProps {
  debounceMs?: number;
}

function SuggestionLabel({ suggestion, query }: { suggestion: string; query: string }) {
  const normalizedQuery = normalizeSearchTerm(query);
  const matchingText = suggestion.slice(0, normalizedQuery.length);
  const remainingText = suggestion.slice(normalizedQuery.length);

  return (
    <span className="suggestion-label">
      <strong>{matchingText}</strong>
      {remainingText}
    </span>
  );
}

export function SearchBox({ debounceMs = DEFAULT_DEBOUNCE_MS }: SearchBoxProps) {
  const listboxId = useId();
  const searchboxRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, loading, hasError } = useSuggestionSearch(
    term,
    searchEnabled,
    debounceMs,
  );
  const normalizedTerm = normalizeSearchTerm(term);
  const canSearch = [...normalizedTerm].length >= MIN_SEARCH_LENGTH;
  const showSuggestions = isOpen && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(-1);

    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions]);

  const selectSuggestion = (suggestion: Suggestion) => {
    setTerm(suggestion.term);
    setSearchEnabled(false);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSearch) {
      setSearchEnabled(true);
      setIsOpen(suggestions.length > 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showSuggestions) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  return (
    <div className="searchbox" ref={searchboxRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          role="combobox"
          aria-label="Termo de busca"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showSuggestions}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          placeholder="Digite sua busca"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setSearchEnabled(true);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={(event) => {
            if (!searchboxRef.current?.contains(event.relatedTarget)) {
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={!canSearch}>
          Buscar
        </button>
      </form>

      {loading && <p className="search-status">Buscando sugestões...</p>}
      {hasError && (
        <p className="search-status search-error" role="alert">
          Não foi possível buscar sugestões.
        </p>
      )}

      <span className="visually-hidden" aria-live="polite">
        {!loading && canSearch && !hasError && suggestions.length === 0
          ? "Nenhuma sugestão encontrada."
          : ""}
      </span>

      {showSuggestions ? (
        <div className="suggestions-list" id={listboxId} role="listbox">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`${listboxId}-option-${index}`}
              className={`suggestion-item ${activeIndex === index ? "is-active" : ""}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onTouchStart={() => setActiveIndex(index)}
              onClick={() => selectSuggestion(suggestion)}
            >
              <span aria-hidden="true" className="search-icon">
                ⌕
              </span>
              <SuggestionLabel suggestion={suggestion.term} query={term} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
