import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import NewEventPage from './pages/NewEventPage.jsx';
import { initialEvents } from './data/events.js';
import { toggleSaved } from './lib/events.js';

export default function App() {
  // The nearest shared parent owns the data used by several routes.
  const [events, setEvents] = useState(initialEvents);
  function handleToggleSaved(id) {
    setEvents(previous => toggleSaved(previous, id));
  }
  function handleCreate(event) {
    setEvents(previous => [...previous, event]);
  }
  return <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/events" replace />} />
      <Route path="events" element={<EventsPage events={events} onToggleSaved={handleToggleSaved} />} />
      <Route path="events/new" element={<NewEventPage onCreate={handleCreate} />} />
      <Route path="events/:eventId" element={<EventDetailPage events={events} onToggleSaved={handleToggleSaved} />} />
      <Route path="about" element={<>
        <h1>How this example works</h1>
        <p>App owns the event array. Pages receive it as props and call callbacks when a user creates or saves an event.</p>
        <p>React Router changes the page without reloading the document. Refreshing starts the app again with the original sample data.</p>
        <p>There is no database, account, payment, or booking API in Module 2. Capacity describes an event; it is not a live seat count.</p>
        <Link to="/events">Try the event browser</Link>
      </>} />
      <Route path="*" element={<><h1>Page not found</h1><Link to="/events">Back to events</Link></>} />
    </Route>
  </Routes>;
}
