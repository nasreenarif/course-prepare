import { useState } from "react";
const events = [
  { id: 1, title: "React Workshop", category: "technology" },
  { id: 2, title: "Career Fair", category: "career" }
];
function CategoryFilter({ value, onChange }) {
  return <label>Category <select value={value} onChange={e => onChange(e.target.value)}>
    <option value="all">All</option><option value="technology">Technology</option><option value="career">Career</option>
  </select></label>;
}
function EventList({ category }) {
  const visible = events.filter(item => category === "all" || item.category === category);
  return <ul>{visible.map(item => <li key={item.id}>{item.title}</li>)}</ul>;
}
export default function App() {
  const [category, setCategory] = useState("all");
  return <main><h1>Find an event</h1><CategoryFilter value={category} onChange={setCategory} /><EventList category={category} /></main>;
}
