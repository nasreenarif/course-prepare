import { emailSettings, makeMailer } from './email.js';
const email = emailSettings();
const mailer = makeMailer(email);
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { User, Task } from './models.js';
import { hashPassword } from './passwords.js';
import { createApp } from './app.js';

const { MONGODB_URI, SESSION_SECRET } = process.env;
if (!MONGODB_URI || !SESSION_SECRET || SESSION_SECRET.length < 32 || SESSION_SECRET.startsWith('replace-')) {
  throw new Error('Configure MONGODB_URI and a generated SESSION_SECRET.');
}
const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
// Only set this after verifying that all requests traverse exactly one trusted proxy.
const trustProxy = process.env.TRUST_PROXY_HOPS === '1' ? 1 : false;
const staticDir = process.env.SERVE_CLIENT === 'true'
  ? fileURLToPath(new URL('../client/dist/', import.meta.url)) : undefined;
if (staticDir && !existsSync(path.join(staticDir, 'index.html'))) throw new Error('Build the client before enabling SERVE_CLIENT.');

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
await User.init();
const store = MongoStore.create({ client: mongoose.connection.getClient(), collectionName: 'sessions' });
store.on('error', () => console.error(JSON.stringify({ event: 'session_store_error' })));
const dummyHash = await hashPassword(randomBytes(32).toString('hex'));
const checkReady = async () => {
  await mongoose.connection.db.admin().command({ ping: 1 }, { timeoutMS: 2000 });
  return true;
};
const app = createApp({ User, Task, store, mailer, appOrigin: email.appOrigin, secret: SESSION_SECRET, dummyHash, production, trustProxy, staticDir, checkReady });
const host = production ? '0.0.0.0' : '127.0.0.1';
const server = app.listen(port, host, () => console.log(JSON.stringify({ event: 'listening', port, production })));
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.close(async error => {
    try { await mongoose.disconnect(); process.exitCode = error ? 1 : 0; }
    catch { process.exitCode = 1; }
    finally { clearTimeout(timeout); }
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
