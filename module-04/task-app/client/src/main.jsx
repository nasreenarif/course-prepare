import { AuthPanel } from './AuthPanel.jsx';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, initializeSession } from './api.js';
import './style.css';

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    let ignore = false;
    async function start() {
      try {
        await initializeSession();
        let account = null;
        try { account = (await api('/auth/me')).user; }
        catch (error) { if (error.status !== 401) throw error; }
        const list = account ? (await api('/tasks')).tasks : [];
        if (!ignore) { setUser(account); setTasks(list); setReady(true); }
      } catch (error) { if (!ignore) setMessage(`${error.message} Reload to retry.`); }
    }
    start();
    return () => { ignore = true; };
  }, []);

  async function run(action) {
    setBusy(true); setMessage('');
    try { await action(); }
    catch (error) {
      setMessage(error.message);
      if (error.status === 401) {
        setUser(null); setTasks([]);
        try { await initializeSession(); } catch { setMessage('Connection lost. Reload to retry.'); }
      }
    } finally { setBusy(false); }
  }
  function addTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = new FormData(form).get('title');
    run(async () => {
      const { task } = await api('/tasks', { method: 'POST', body: { title } });
      setTasks(items => [task, ...items]); form.reset();
    });
  }
  function toggle(task) {
    run(async () => {
      const data = await api(`/tasks/${task.id}`, { method: 'PATCH', body: { completed: !task.completed } });
      setTasks(items => items.map(item => item.id === task.id ? data.task : item));
    });
  }
  function remove(task) {
    run(async () => {
      await api(`/tasks/${task.id}`, { method: 'DELETE' });
      setTasks(items => items.filter(item => item.id !== task.id));
    });
  }
  function logout() {
    run(async () => {
      await api('/auth/logout', { method: 'POST' });
      setUser(null); setTasks([]); await initializeSession();
    });
  }
  return <main><h1>My tasks</h1>
    <p role="status" aria-live="polite">{message || (busy ? 'Working…' : '')}</p>
    {!ready ? <p>Connecting to your session…</p> : !user ? <>
      <AuthPanel onSignedIn={account => { setUser(account); run(async () => setTasks((await api('/tasks')).tasks)); }} />
    </> : <>
      <p>Signed in as {user.email}</p><button disabled={busy} onClick={logout}>Sign out</button>
      <form onSubmit={addTask}><fieldset disabled={busy}><legend>Add a task</legend><label htmlFor="title">Task title</label><input id="title" name="title" maxLength={200} required /><button>Add task</button></fieldset></form>
      <h2>Your most recent tasks</h2><p>Up to 100 saved tasks are loaded when you sign in.</p>
      {tasks.length === 0 ? <p>No tasks yet. Add your first task above.</p> : <ul>{tasks.map(task => <li key={task.id}>
        <span>{task.title} — {task.completed ? 'complete' : 'incomplete'}</span>{' '}
        <button disabled={busy} onClick={() => toggle(task)} aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}>Toggle status</button>{' '}
        <button disabled={busy} onClick={() => remove(task)} aria-label={`Delete ${task.title}`}>Delete</button>
      </li>)}</ul>}
    </>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
