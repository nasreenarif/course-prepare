function Card({ title, children }) {
  return <section className="card"><h2>{title}</h2>{children}</section>;
}
export default function App() {
  return (
    <main>
      <h1>Project workspace</h1>
      <Card title="Event summary"><p>React Workshop in the Computer Lab.</p></Card>
      <Card title="Before submitting"><ul><li>Review the proposal.</li><li>Check the repository link.</li></ul></Card>
    </main>
  );
}
