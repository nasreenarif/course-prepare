import React, { useEffect, useRef } from 'react';
export function DeleteDialog({ task, busy, onCancel, onDelete }) {
  const dialog = useRef(null), cancel = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal(); cancel.current.focus();
    return () => element.close();
  }, []);
  function keepTabInside(event) {
    if (event.key !== 'Tab') return;
    // This dialog contains only these two native buttons.
    const buttons = [...dialog.current.querySelectorAll('button')];
    if (!buttons.length) { event.preventDefault(); return; }
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog onKeyDown={keepTabInside} ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description"
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <h2 id="delete-title">Delete this task?</h2>
    <p id="delete-description">This removes “{task.title}”. You cannot undo it in this app.</p>
    <div className="actions"><button ref={cancel} aria-disabled={busy} onClick={() => { if (!busy) onCancel(); }}>Keep task</button>
      <button aria-disabled={busy} onClick={() => { if (!busy) onDelete(); }}>{busy ? 'Deleting…' : 'Confirm deletion'}</button></div>
    <p role="status">{busy ? 'Deleting task. Please wait.' : ''}</p>
  </dialog>;
}
