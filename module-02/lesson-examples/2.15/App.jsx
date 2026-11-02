import { useState } from "react";
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <main>
      <h1>Workshop information</h1>
      <button type="button" aria-expanded={isOpen} aria-controls="details" onClick={() => setIsOpen(open => !open)}>
        {isOpen ? "Hide details" : "Show details"}
      </button>
      <div id="details" hidden={!isOpen}><p>Bring your laptop to the workshop.</p></div>
    </main>
  );
}
