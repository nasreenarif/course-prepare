import { useState } from "react";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  function handleSelect(id) { setSelectedId(id); }
  return (
    <main>
      <h1>Event interactions</h1>
      <label htmlFor="query">Search text</label>
      <input id="query" value={query} onChange={e => setQuery(e.target.value)} />
      <p>Current text: {query}</p>
      <button type="button" onClick={() => handleSelect(3)}>Select event 3</button>
      <button type="button" onClick={() => setSelectedId(null)}>Clear selection</button>
      <p role="status">{selectedId === null ? "Nothing selected" : `Selected event ${selectedId}`}</p>
    </main>
  );
}
