import { useState } from "react";
const initialForm = { title: "", description: "", category: "academic", isPublic: false };
export default function App() {
  const [form, setForm] = useState(initialForm);
  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm(previous => ({ ...previous, [name]: nextValue }));
  }
  return (
    <main>
      <h1>Event draft</h1>
      <form onSubmit={e => e.preventDefault()}>
        <p><label htmlFor="title">Title</label><input id="title" name="title" value={form.title} onChange={handleChange} /></p>
        <p><label htmlFor="description">Description</label><textarea id="description" name="description" value={form.description} onChange={handleChange} /></p>
        <p><label htmlFor="category">Category</label><select id="category" name="category" value={form.category} onChange={handleChange}>
          <option value="academic">Academic</option><option value="career">Career</option>
        </select></p>
        <p><label><input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} /> Public event</label></p>
        <button type="button" onClick={() => setForm(initialForm)}>Reset draft</button>
      </form>
      <section><h2>Preview</h2><p>{form.title || "Untitled event"}</p><p>{form.description}</p><p>{form.category} — {form.isPublic ? "Public" : "Private"}</p></section>
      <p>This preview is temporary and is not saved to a database.</p>
    </main>
  );
}
