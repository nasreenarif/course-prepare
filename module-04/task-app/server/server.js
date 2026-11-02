import { emailSettings, makeMailer } from './email.js';
const email = emailSettings();
const mailer = makeMailer(email);
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { randomBytes } from 'node:crypto';
import { User, Task } from './models.js';
import { hashPassword } from './passwords.js';
import { createApp } from './app.js';

const { MONGODB_URI, SESSION_SECRET } = process.env;
if (!MONGODB_URI || !SESSION_SECRET || SESSION_SECRET.length < 32 || SESSION_SECRET.startsWith('replace-')) {
  throw new Error('Set MONGODB_URI and a generated SESSION_SECRET in server/.env.');
}
await mongoose.connect(MONGODB_URI);
await User.init(); // Wait for the unique email index before accepting requests.
const store = MongoStore.create({ client: mongoose.connection.getClient(), collectionName: 'sessions' });
store.on('error', error => console.error('Session store error:', error.name));
const dummyHash = await hashPassword(randomBytes(32).toString('hex'));
const app = createApp({ User, Task, store, mailer, appOrigin: email.appOrigin, secret: SESSION_SECRET, dummyHash, production: process.env.NODE_ENV === 'production' });
const port = Number(process.env.PORT || 3000);
app.listen(port, '127.0.0.1', () => console.log(`Task API listening at http://localhost:${port}`));
