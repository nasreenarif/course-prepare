import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../lib/events.js';

export default function EventDetailPage({ events, onToggleSaved }) {
  // URL parameters are strings. This example deliberately uses string IDs.
  const { eventId } = useParams();
  const event = events.find(item => item.id === eventId);
  if (!event) return <>
    <h1>Event not found</h1>
    <p>This ID does not exist in memory. Refreshing also removes newly created events.</p>
    <Link to="/events">Back to events</Link>
  </>;
  return <>
    <Link to="/events">← Back to events</Link>
    <p className="eyebrow">{event.category}</p>
    <h1>{event.title}</h1>
    <dl className="details">
      <dt>When</dt><dd><time dateTime={event.date}>{formatDate(event.date)}</time></dd>
      <dt>Where</dt><dd>{event.location}</dd>
      <dt>Capacity</dt><dd>{event.capacity} people</dd>
    </dl>
    <button type="button" aria-pressed={event.saved} onClick={() => onToggleSaved(event.id)}>
      {event.saved ? 'Unsave' : 'Save'} {event.title}
    </button>
    <p className="hint">Your favorite is shared with the browse page through state in App.</p>
  </>;
}
