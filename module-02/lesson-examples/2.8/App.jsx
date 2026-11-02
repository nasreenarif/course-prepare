function EventCard({ title, location, date }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{location}</p>
      <p><time dateTime={date}>{date}</time></p>
    </article>
  );
}
export default function App() {
  return (
    <main>
      <h1>Upcoming events</h1>
      <EventCard title="React Workshop" location="Computer Lab" date="2027-01-20" />
      <EventCard title="Career Fair" location="Student Center" date="2027-01-22" />
    </main>
  );
}
