import { AuthPanel } from './AuthPanel.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, initializeSession } from './api.js';
import { TaskForm } from './TaskForm.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import './style.css';
import { Captcha } from './Captcha.jsx';
import { DeleteDialog } from './DeleteDialog.jsx';

function App() {
  const [captcha, setCaptcha] = useState({ enabled: false, siteKey: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const listHeading = useRef(null), returnFocus = useRef(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const locked = useRef(false);
  const nextLoadMessage = useRef('');
  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setStatus('loading'); setMessage(nextLoadMessage.current); nextLoadMessage.current = '';
    async function load() {
      try {
        await initializeSession();
        const configuration = await api('/config', { signal: controller.signal });
        if (!ignore) setCaptcha(configuration.captcha);
        if (ignore) return;
        let account = null;
        try { account = (await api('/auth/me', { signal: controller.signal })).user; }
        catch (error) { if (error.status !== 401) throw error; }
        const list = account ? (await api('/tasks', { signal: controller.signal })).tasks : [];
        if (!ignore) { setUser(account); setTasks(list); setStatus('ready'); }
      } catch (error) {
        if (!ignore && error.code !== 'CANCELLED') { setStatus('error'); setMessage(error.message); }
      }
    }
    load();
    return () => { ignore = true; controller.abort(); };
  }, [version]);

  function handleFailure(error) {
    const reference = error.requestId ? ` Reference: ${error.requestId}` : '';
    const feedback = error.message + reference;
    if (error.status === 401 && user) {
      nextLoadMessage.current = feedback;
      setUser(null); setTasks([]); setVersion(value => value + 1);
    }
    setMessage(feedback);
  }
  async function run(action) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('');
    try { await action(); return true; }
    catch (error) { handleFailure(error); return false; }
    finally { locked.current = false; setBusy(false); }
  }
  async function createTask(title) {
    if (locked.current) throw new Error('Wait for the current operation to finish.');
    locked.current = true; setBusy(true); setMessage('');
    try {
      const { task } = await api('/tasks', { method: 'POST', body: { title } });
      setTasks(items => [task, ...items]);
    } catch (error) { handleFailure(error); throw error; }
    finally { locked.current = false; setBusy(false); }
  }
  async function change(task, remove = false) {
    const success = await run(async () => {
      const result = await api(`/tasks/${task.id}`, { method: remove ? 'DELETE' : 'PATCH', body: remove ? {} : { completed: !task.completed } });
      setTasks(items => remove ? items.filter(item => item.id !== task.id) : items.map(item => item.id === task.id ? result.task : item));
      setMessage(remove ? 'Task deleted.' : 'Task updated.');
    });
    if (remove) { setDeleting(null); requestAnimationFrame(() => { if (success) listHeading.current?.focus(); else if (returnFocus.current?.isConnected) returnFocus.current.focus(); else document.getElementById('main-content')?.focus(); }); }
  }
  function logout() {
    run(async () => {
      await api('/auth/logout', { method: 'POST' });
      setUser(null); setTasks([]); setVersion(value => value + 1);
    });
  }
  return <><a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header"><p>CS418 · Module 6 practice</p></header>
    <main id="main-content" tabIndex={-1}><h1>My tasks</h1>
    <p role="status">{message || (busy ? 'Working…' : '')}</p>
    {status === 'loading' ? <p role="status">Loading account and tasks…</p> : status === 'error' ? <section aria-labelledby="load-error"><h2 id="load-error">Unable to load</h2><p>Check the connection, then retry this read.</p><button onClick={() => setVersion(value => value + 1)}>Retry loading</button></section> : !user ? <>
      <AuthPanel onSignedIn={account => { setUser(account); setVersion(value => value + 1); }}
        captchaEnabled={captcha.enabled} captchaToken={captchaToken}
        captchaContent={captcha.enabled ? <Captcha siteKey={captcha.siteKey} onToken={setCaptchaToken} resetVersion={captchaReset} /> : <p>Local practice: CAPTCHA is disabled.</p>}
        onRegistrationAttempt={() => { setCaptchaToken(''); setCaptchaReset(value => value + 1); }} />
    </> : <>
      <p>Signed in as {user.email}</p><button disabled={busy} onClick={logout}>Sign out</button>{' '}
      <button disabled={busy} onClick={() => setVersion(value => value + 1)}>Refresh list</button>
      <TaskForm onCreate={createTask} disabled={busy} />
      <h2 ref={listHeading} tabIndex={-1}>Your most recent tasks</h2><p>Up to 100 tasks are loaded. Refreshing clears unsaved form input.</p>
      {tasks.length === 0 ? <p>No tasks yet. Add your first task above.</p> : <ul className="task-list">{tasks.map(task => <li className="task-card" key={task.id}>
        <span>{task.title} — {task.completed ? 'complete' : 'incomplete'}</span>{' '}
        <button disabled={busy} onClick={() => change(task)} aria-label={`Toggle status for ${task.title}: mark ${task.completed ? 'incomplete' : 'complete'}`}>Toggle status</button>{' '}
        <button disabled={busy} onClick={event => { returnFocus.current = event.currentTarget; setDeleting(task); }} aria-label={`Delete ${task.title}`}>Delete</button>
      </li>)}</ul>}
    </>}
    {deleting && <DeleteDialog task={deleting} busy={busy} onCancel={() => { setDeleting(null); requestAnimationFrame(() => returnFocus.current?.focus()); }} onDelete={() => change(deleting, true)} />}
  </main></>;
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
