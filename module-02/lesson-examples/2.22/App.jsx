import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
const events = [{ id: 1, title: "React Workshop" }, { id: 2, title: "Career Fair" }];
function EventsPage() {
  return <><h1>Events</h1><ul>{events.map(item => <li key={item.id}><Link to={`/events/${item.id}`}>{item.title}</Link></li>)}</ul></>;
}
function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = events.find(item => String(item.id) === eventId);
  if (!event) return <><h1>Event not found</h1><Link to="/events">Browse events</Link></>;
  return <><h1>{event.title}</h1><p>Event ID: {event.id}</p><button type="button" onClick={() => navigate("/events")}>Return to events</button></>;
}
function NotFoundPage() { return <><h1>Page not found</h1><Link to="/events">Browse events</Link></>; }
export default function App() {
  return <BrowserRouter><main><Routes>
    <Route path="/" element={<EventsPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/events/:eventId" element={<EventDetailsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></main></BrowserRouter>;
}
