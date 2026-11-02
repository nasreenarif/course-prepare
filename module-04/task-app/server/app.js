import express from 'express';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { installAuth } from './auth.js';
import { AuthError } from './identity.js';

const publicTask = task => ({ id: String(task._id), title: task.title, completed: task.completed });
const fail = (status, message) => Object.assign(new Error(message), { status });
const saveSession = req => new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));

function taskInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Send a JSON object.');
  const keys = Object.keys(body);
  if (!keys.length || keys.some(key => !['title', 'completed'].includes(key))) throw fail(400, 'Only title and completed can be changed.');
  const result = {};
  if (!partial || Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 200) throw fail(400, 'Title must contain 1 to 200 characters.');
    result.title = body.title.trim();
  }
  if (Object.hasOwn(body, 'completed')) {
    if (typeof body.completed !== 'boolean') throw fail(400, 'Completed must be true or false.');
    result.completed = body.completed;
  }
  return result;
}

export function createApp({ User, Task, store, secret, mailer, appOrigin = 'http://localhost:5173', authClock = Date.now, production = false, dummyHash, limiter = true }) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '16kb' }));
  app.use(session({
    name: 'cs418.sid', secret, store, resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 60 * 60 * 1000, path: '/' }
  }));
  // The token belongs to this session and is renewed after login.
  app.get('/api/auth/csrf', async (req, res) => {
    req.session.csrf ??= randomBytes(32).toString('hex');
    await saveSession(req);
    res.json({ csrfToken: req.session.csrf });
  });
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!req.is('application/json')) return next(fail(415, 'Send application/json.'));
    const supplied = req.get('X-CSRF-Token');
    if (!supplied || supplied !== req.session.csrf) return next(fail(403, 'Refresh the page and try again.'));
    next();
  });
  if (limiter) app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    skip: req => req.method === 'GET' && req.path !== '/verify-email', message: { error: 'Too many attempts. Try again later.' } }));
  const requireUser = installAuth(app, { User, secret, dummyHash, mailer, appOrigin,
    cookieName: 'cs418.sid', production, now: authClock });
  app.use('/api/tasks', requireUser);
  app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ tasks: tasks.map(publicTask) });
  });
  app.post('/api/tasks', async (req, res) => {
    const input = taskInput(req.body);
    const task = await Task.create({ ...input, owner: req.user._id });
    res.status(201).json({ task: publicTask(task) });
  });
  app.param('id', (req, res, next, id) => /^[a-f0-9]{24}$/i.test(id) ? next() : next(fail(400, 'Invalid task ID.')));
  app.get('/api/tasks/:id', async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) throw fail(404, 'Task not found.');
    res.json({ task: publicTask(task) });
  });
  app.patch('/api/tasks/:id', async (req, res) => {
    const update = taskInput(req.body, true);
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: update }, { new: true, runValidators: true });
    if (!task) throw fail(404, 'Task not found.');
    res.json({ task: publicTask(task) });
  });
  app.delete('/api/tasks/:id', async (req, res) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) throw fail(404, 'Task not found.');
    res.status(204).end();
  });
  app.use((req, res, next) => next(fail(404, 'Route not found.')));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 11000) return res.status(409).json({ error: 'Unable to create an account with those details.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: 'Invalid field value.' });
    if (error instanceof AuthError) return res.status(error.status).json({ error: error.message, code: error.code });
    const status = error.status || 500;
    if (status >= 500) console.error('Request failed:', error.name);
    res.status(status).json({ error: status >= 500 ? 'Server error. Try again later.' : error.message });
  });
  return app;
}
