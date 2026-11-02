function Header() {
  return <header><h1>Campus Events</h1></header>;
}
function EventCard() {
  return <article><h2>React Workshop</h2><p>Location: Computer Lab</p></article>;
}
function Footer() {
  return <footer><p>Campus Events learning example</p></footer>;
}
export default function App() {
  return <><Header /><main><EventCard /></main><Footer /></>;
}
