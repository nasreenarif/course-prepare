import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/events.js';
import { validateEvent } from '../lib/events.js';

const emptyForm = { title: '', category: '', date: '', location: '', capacity: '20' };
const labels = { title: 'Title', category: 'Category', date: 'Date', location: 'Location', capacity: 'Capacity' };

export default function NewEventPage({ onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // Keep the document and React state alive.
    const result = validateEvent(form);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;
    // Generate an ID once when creating data, never inside render or a map key.
    const created = { ...result.value, id: crypto.randomUUID(), saved: false };
    onCreate(created);
    navigate(`/events/${created.id}`);
  }

  function fieldProps(name) {
    return {
      id: name, name, value: form[name], onChange: handleChange,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    };
  }

  return <>
    <h1>Create an event</h1>
    <p>All fields are required. Use fictional details. This saves to React state for this visit only.</p>
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      {Object.keys(errors).length > 0 && <div role="alert" className="error-summary">
        <h2>Check these fields</h2>
        <ul>{Object.entries(errors).map(([name, message]) =>
          <li key={name}><a href={`#${name}`}>{labels[name]}: {message}</a></li>,
        )}</ul>
      </div>}
      <div><label htmlFor="title">Title (3–80 characters)</label>
        <input {...fieldProps('title')} required maxLength={80} />
        {errors.title && <p className="error" id="title-error">{errors.title}</p>}
      </div>
      <div><label htmlFor="category">Category</label>
        <select {...fieldProps('category')} required>
          <option value="">Choose a category</option>
          {categories.map(value => <option key={value}>{value}</option>)}
        </select>
        {errors.category && <p className="error" id="category-error">{errors.category}</p>}
      </div>
      <div><label htmlFor="date">Date</label>
        <input {...fieldProps('date')} type="date" required />
        {errors.date && <p className="error" id="date-error">{errors.date}</p>}
      </div>
      <div><label htmlFor="location">Location (2–100 characters)</label>
        <input {...fieldProps('location')} required maxLength={100} />
        {errors.location && <p className="error" id="location-error">{errors.location}</p>}
      </div>
      <div><label htmlFor="capacity">Capacity (1–500 people)</label>
        <input {...fieldProps('capacity')} type="number" min="1" max="500" step="1" required />
        {errors.capacity && <p className="error" id="capacity-error">{errors.capacity}</p>}
      </div>
      <button type="submit">Create event</button>
    </form>
  </>;
}
