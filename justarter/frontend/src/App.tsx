import { SearchBox } from "./components/SearchBox";
import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <section className="search-page" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">
          J
        </div>

        <div className="search-content">
          <h1 id="page-title">Busca com Autocompletar</h1>
          <p>Digite no campo abaixo para exibir as sugestões</p>
          <SearchBox />
        </div>
      </section>
    </main>
  );
}

export default App;
