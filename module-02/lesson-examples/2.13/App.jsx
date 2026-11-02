function EventsPanel({ isLoading, error, events }) {
  if (isLoading) return <p role="status">Loading events…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (events.length === 0) return <p>No events match your search.</p>;
  return <ul>{events.map(event => <li key={event.id}>{event.title}</li>)}</ul>;
}
export default function App() {
  return <main><h1>Events</h1><EventsPanel isLoading={false} error="" events={[{ id: 1, title: "React Workshop" }]} /></main>;
}
