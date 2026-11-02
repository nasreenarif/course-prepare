import { events } from "../data/events.js";
import EventCard from "../components/EventCard.jsx";
export default function EventsPage() {
  return <><h1>Events</h1>{events.map(event => <EventCard key={event.id} event={event} />)}</>;
}
