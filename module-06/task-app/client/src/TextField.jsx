import React, { useId } from 'react';
export function TextField({ label, name, value, onChange, help, error = '', inputRef }) {
  const id = useId();
  const description = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ');
  return <div>
    <label htmlFor={id}>{label}</label>
    {help && <p id={`${id}-help`}>{help}</p>}
    <input ref={inputRef} id={id} name={name} value={value} required
      aria-invalid={Boolean(error)} aria-describedby={description || undefined}
      onChange={event => onChange(event.target.value)} />
    {error && <p className="error" id={`${id}-error`}>{error}</p>}
  </div>;
}
