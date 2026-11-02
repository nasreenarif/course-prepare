import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="header-inner">
        <span className="brand">Campus Events <small>CS418 · Module 2</small></span>
        <nav aria-label="Main navigation">
          <NavLink to="/events" end>Browse</NavLink>
          <NavLink to="/events/new">Create an event</NavLink>
          <NavLink to="/about">How it works</NavLink>
        </nav>
      </div>
    </header>
    <main id="main-content" tabIndex={-1}>
      <p className="notice">Local learning demo. Changes last until you refresh this page. No real bookings are made.</p>
      <Outlet />
    </main>
    <footer>Practice with fictional events. Add a backend in a later module.</footer>
  </>;
}
