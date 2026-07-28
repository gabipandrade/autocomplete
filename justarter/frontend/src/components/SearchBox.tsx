import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_SUGGESTIONS } from "../graphql/queries";
import "./SearchBox.css";

export function SearchBox() {
  const [term, setTerm] = useState("");
  const [searchSuggestions, { data, loading, error }] = useLazyQuery(GET_SUGGESTIONS);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (term.trim().length >= 4) {
      searchSuggestions({ variables: { term } });
    }
  };

  return (
    <div className="searchbox">
      <form onSubmit={handleSubmit}>
        <input
          aria-label="Termo de busca"
          placeholder="Pesquise por um termo"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p className="error">Erro ao buscar sugestões.</p>}
      {data?.suggestions?.length ? (
        <ul>
          {data.suggestions.map((item: { id: string; term: string }) => (
            <li key={item.id}>{item.term}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
