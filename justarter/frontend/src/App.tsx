import { SearchBox } from "./components/SearchBox";
import "./App.css";

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <h1>Justarter</h1>
        <p>Busque sugestões com uma API GraphQL e um backend em PostgreSQL.</p>
        <SearchBox />
      </section>
    </main>
  );
}

export default App;
