const event = { title: "React Workshop", location: "Computer Lab", seats: 12 };
export default function App() {
  return <main>
    <h1>Campus Events</h1>
    <article className="event-card">
      <h2>{event.title}</h2><p>Location: {event.location}</p>
      <p>{event.seats > 0 ? `${event.seats} seats available` : 'This event is full'}</p>
    </article>
  </main>;
}
