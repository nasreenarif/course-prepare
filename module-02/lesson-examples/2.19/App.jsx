import { useState } from "react";
export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Enter an event title.";
    if (!description.trim()) nextErrors.description = "Enter a description.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setMessage("Validation passed. This practice draft was not saved to a server.");
  }
  function resetDraft() {
    setTitle(""); setDescription(""); setErrors({}); setMessage("");
  }
  return (
    <main>
      <h1>Validate an event draft</h1>
      <form noValidate onSubmit={handleSubmit}>
        <p><label htmlFor="title">Title (required)</label>
          <input id="title" required value={title} onChange={e => { setTitle(e.target.value); setMessage(""); }} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} />
          {errors.title && <span id="title-error">{errors.title}</span>}</p>
        <p><label htmlFor="description">Description (required)</label>
          <textarea id="description" required value={description} onChange={e => { setDescription(e.target.value); setMessage(""); }} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} />
          {errors.description && <span id="description-error">{errors.description}</span>}</p>
        {Object.keys(errors).length > 0 && <p role="alert">Please correct the fields identified above.</p>}
        <button type="submit">Check draft</button>
        <button type="button" onClick={resetDraft}>Reset draft</button>
      </form>
      <p role="status">{message}</p>
    </main>
  );
}
