import React, { useEffect, useRef, useState } from 'react';
import { titleError } from './validation.js';

export function TaskForm({ onCreate, disabled = false, draft }) {
  const [title, setTitle] = useState('');
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const input = useRef(null);
  const inFlight = useRef(false);
  useEffect(()=>{if(draft){setTitle(draft.title);setFieldError('');setMessage('Draft copied. Review and edit before saving.');input.current?.focus();}},[draft]);
  const visibleError = fieldError || (touched ? titleError(title) : '');
  useEffect(() => { if (fieldError && !saving) input.current?.focus(); }, [fieldError, saving]);
  async function submit(event) {
    event.preventDefault();
    if (inFlight.current || disabled) return;
    setTouched(true); setMessage(''); setFieldError('');
    const error = titleError(title);
    if (error) { setFieldError(error); input.current?.focus(); return; }
    inFlight.current = true; setSaving(true);
    try {
      await onCreate(title.trim());
      setTitle(''); setTouched(false); setMessage('Task saved.');
    } catch (error) {
      setFieldError(error.fields?.title || '');
      setMessage(error.fields?.title ? '' : error.message);
      if (error.fields?.title) input.current?.focus();
    } finally { inFlight.current = false; setSaving(false); }
  }
  return <form onSubmit={submit} noValidate aria-busy={saving}>
    <fieldset disabled={saving || disabled}><legend>Add a task</legend>
      <label htmlFor="title">Task title</label>
      <p id="title-help">Use 1–200 characters after trimming surrounding spaces.</p>
      <input ref={input} id="title" name="title" value={title} required
        aria-invalid={Boolean(visibleError)} aria-describedby={`title-help${visibleError ? ' title-error' : ''}`}
        onBlur={() => setTouched(true)} onChange={event => { setTitle(event.target.value); setFieldError(''); setMessage(''); }} />
      {visibleError && <p id="title-error" className="error">{visibleError}</p>}
      <button type="submit">{saving ? 'Saving…' : 'Add task'}</button>
    </fieldset>
    <p role="status">{message}</p>
  </form>;
}
