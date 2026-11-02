function EventCard({ title, seats = 0, location = "To be announced" }) {
  return <article><h2>{title}</h2><p>{location}</p><p>{seats} seats</p></article>;
}
export default function App() {
  return (
    <main>
      <h1>Events</h1>
      <EventCard title="React Workshop" seats={12} location="Computer Lab" />
      <EventCard title="Career Fair" seats={0} />
    </main>
  );
}
