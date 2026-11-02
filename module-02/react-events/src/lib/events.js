import { categories } from '../data/events.js';

export function filterEvents(events, query, category, savedOnly) {
  const search = query.trim().toLowerCase();
  return events.filter(event =>
    (!search || `${event.title} ${event.location}`.toLowerCase().includes(search)) &&
    (!category || event.category === category) &&
    (!savedOnly || event.saved),
  );
}

export function toggleSaved(events, id) {
  // Copy only the changed record; never mutate a prop or a previous state value.
  return events.map(event => event.id === id ? { ...event, saved: !event.saved } : event);
}

export function validateEvent(form) {
  const title = form.title.trim();
  const location = form.location.trim();
  const capacity = Number(form.capacity);
  const errors = {};
  if (title.length < 3 || title.length > 80) errors.title = 'Enter a title of 3–80 characters.';
  if (!categories.includes(form.category)) errors.category = 'Choose a listed category.';
  if (location.length < 2 || location.length > 100) errors.location = 'Enter a location of 2–100 characters.';
  // A matching shape alone would accept February 30. Round-trip the calendar date.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(form.date) ? new Date(`${form.date}T12:00:00Z`) : null;
  if (!date || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.date) {
    errors.date = 'Choose a valid calendar date.';
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
    errors.capacity = 'Enter a whole-number capacity from 1 to 500.';
  }
  return {
    errors,
    value: { title, category: form.category, date: form.date, location, capacity },
  };
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${value}T12:00:00Z`));
}
