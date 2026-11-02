const events = [
  { id: 1, title: "React Workshop", isOpen: true },
  { id: 2, title: "Career Fair", isOpen: false },
  { id: 3, title: "Club Meeting", isOpen: true }
];
function EventCard({ event }) { return <article><h2>{event.title}</h2></article>; }
export default function App() {
  const openEvents = events.filter(event => event.isOpen);
  return (
    <main>
      <h1>Open events</h1>
      {openEvents.length === 0 ? <p>No open events.</p> : (
        <ul>{openEvents.map(event => <li key={event.id}><EventCard event={event} /></li>)}</ul>
      )}
    </main>
  );
}
