import { Link } from 'react-router-dom';
import { formatDate } from '../lib/events.js';

// Props carry data downward. The callback sends a user's intent back to App.
// children lets the parent compose extra content without duplicating this card.
export default function EventCard({ event, onToggleSaved, children }) {
  return <article className="event-card">
    <p className="eyebrow">{event.category}</p>
    <h2><Link to={`/events/${event.id}`}>{event.title}</Link></h2>
    <p><time dateTime={event.date}>{formatDate(event.date)}</time></p>
    <p>{event.location} · Capacity: {event.capacity}</p>
    {children}
    <button type="button" className="secondary" aria-pressed={event.saved}
      onClick={() => onToggleSaved(event.id)}>
      {event.saved ? 'Unsave' : 'Save'} {event.title}
    </button>
  </article>;
}
