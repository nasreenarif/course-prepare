import express from 'express';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';
import { AppError, errorHandler } from './errors.js';
import { taskInput } from './validation.js';
import { installAuth } from './auth.js';

const publicTask = task => ({ id: String(task._id), title: task.title, completed: task.completed });
const fail = (status, message) => new AppError(status, message);
const saveSession = req => new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));

export function createApp({ User, Task, store, secret, mailer, appOrigin = 'http://localhost:5173', authClock = Date.now, production = false, dummyHash, limiter = true, trustProxy = false, staticDir, checkReady = async () => true }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    next();
  });
  app.get('/api/health', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      if (!await checkReady()) throw new Error('not ready');
      res.json({ status: 'ready' });
    } catch { res.status(503).json({ status: 'unavailable' }); }
  });
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '16kb' }));
  app.use(session({
    name: 'cs418.m5.sid', secret, store, resave: false, saveUninitialized: false,
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
    skip: req => req.method === 'GET' && req.path !== '/verify-email', handler: (req, res) => res.status(429).json({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED', fields: {}, requestId: req.requestId }) }));
  const requireUser = installAuth(app, { User, secret, dummyHash, mailer, appOrigin,
    cookieName: 'cs418.m5.sid', production, now: authClock });
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
  // API failures must stay JSON even when the React app is served here.
  app.use('/api', (req, res, next) => next(new AppError(404, 'Route not found.', { code: 'NOT_FOUND' })));
  if (staticDir) {
    app.use(express.static(staticDir, { index: false, maxAge: 0 }));
    app.get(/^\/(?!api(?:\/|$)).*/, (req, res, next) => {
      if (!req.accepts('html') || path.extname(req.path)) return next();
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }
  app.use((req, res, next) => next(new AppError(404, 'Route not found.', { code: 'NOT_FOUND' })));
  app.use(errorHandler);
  return app;
}
