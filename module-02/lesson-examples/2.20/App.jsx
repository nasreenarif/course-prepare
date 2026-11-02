import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
function HomePage() { return <><h1>Campus Events</h1><p>Welcome to the event browser.</p></>; }
function EventsPage() { return <><h1>Events</h1><p>Sample events will appear here.</p></>; }
function AboutPage() { return <><h1>About</h1><p>A frontend learning example.</p></>; }
function NotFoundPage() { return <><h1>Page not found</h1><Link to="/">Return home</Link></>; }
export default function App() {
  return (
    <BrowserRouter>
      <nav aria-label="Primary navigation"><Link to="/">Home</Link>{" | "}<Link to="/events">Events</Link>{" | "}<Link to="/about">About</Link></nav>
      <main><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes></main>
    </BrowserRouter>
  );
}
