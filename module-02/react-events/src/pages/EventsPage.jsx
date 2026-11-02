import { useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard.jsx';
import { categories } from '../data/events.js';
import { filterEvents } from '../lib/events.js';

export default function EventsPage({ events, onToggleSaved }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  // Derived data is calculated from state. A second state copy could get stale.
  const visibleEvents = filterEvents(events, query, category, savedOnly);
  const savedCount = events.filter(event => event.saved).length;

  return <>
    <p className="eyebrow">Find your next campus activity</p>
    <h1>Explore events</h1>
    <p>Search the sample events, save a favorite, or <Link to="/events/new">create your own</Link>.</p>
    <section className="filters" aria-label="Filter events">
      <div><label htmlFor="search">Search title or location</label>
        <input id="search" type="search" value={query} onChange={event => setQuery(event.target.value)} />
      </div>
      <div><label htmlFor="category-filter">Category</label>
        <select id="category-filter" value={category} onChange={event => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>
      <label className="checkbox-label"><input type="checkbox" checked={savedOnly}
        onChange={event => setSavedOnly(event.target.checked)} /> Saved only</label>
      <button type="button" className="secondary" onClick={() => {
        setQuery(''); setCategory(''); setSavedOnly(false);
      }}>Clear filters</button>
    </section>
    <p role="status">Showing {visibleEvents.length} of {events.length} events. {savedCount} saved.</p>
    {visibleEvents.length === 0
      ? <p className="empty-state">No matching events. Clear the filters or create an event.</p>
      : <div className="event-grid">{visibleEvents.map(event =>
        <EventCard key={event.id} event={event} onToggleSaved={onToggleSaved}>
          <p className="hint">Saving marks a favorite; it does not reserve a seat.</p>
        </EventCard>,
      )}</div>}
  </>;
}
