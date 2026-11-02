import { BrowserRouter, Routes, Route, NavLink, Outlet, Link } from "react-router-dom";
function RootLayout() {
  return (
    <>
      <header><p>Campus Events</p><nav aria-label="Primary navigation">
        <NavLink to="/" end>Home</NavLink>{" | "}<NavLink to="/events">Events</NavLink>
      </nav></header>
      <main id="main-content"><Outlet /></main>
      <footer><p>Campus Events learning example</p></footer>
    </>
  );
}
function HomePage() { return <><h1>Home</h1><p>Welcome.</p></>; }
function EventsPage() { return <><h1>Events</h1><p>Browse sample events.</p></>; }
function NotFoundPage() { return <><h1>Page not found</h1><Link to="/">Return home</Link></>; }
export default function App() {
  return <BrowserRouter><Routes>
    <Route element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes></BrowserRouter>;
}
