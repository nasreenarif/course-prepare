MODULE 4 TASK APP — LOCAL LEARNING COMPANION

EMAIL AUTHENTICATION
For the normal MongoDB app, read AUTH_SETUP.md and ../../docs/AUTHENTICATION.md.
Configure APP_ORIGIN, GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.
Register -> click the emailed verification link -> password -> emailed OTP.
Private tasks stay blocked until the OTP is accepted.
Verification link: 30 minutes; OTP: 5 minutes/5 attempts; resend: 60 seconds.
The normal server never prints verification links or OTPs.


Read lessons 4.1–4.4 before running this project.
Use Node.js 24.x, npm, and a running MongoDB service for this course.
Use this separate app/database to study Module 4. Compare the API contracts
before adapting your Module 3 project; no automatic upgrade is performed.

BACKEND — terminal 1
1. cd server
2. npm ci (or npm install if a lockfile is unavailable)
3. Copy .env.example to .env. In PowerShell: Copy-Item .env.example .env
4. Generate a secret:
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
5. Put the result in SESSION_SECRET in .env.
6. Set MONGODB_URI to your own practice database. The sample uses a local
   MongoDB service at mongodb://127.0.0.1:27017/cs418_module4.
7. npm start
Expected: Task API listening at http://localhost:3000

FRONTEND — terminal 2
1. cd client
2. npm ci (or npm install if a lockfile is unavailable)
3. npm run dev
4. Open http://localhost:5173 consistently; do not alternate hostnames.

Register with an inbox you can open, click the verification link, then sign in with password and emailed OTP. Registration does not log you in.
Use a practice passphrase of 15–128 characters. Do not reuse real passwords.
The Vite development proxy sends /api requests to Express. Relative API paths
in src/api.js intentionally use the browser's origin.

FILES
server/server.js    Configuration, database connection, session store, listener
server/app.js       Middleware, account routes, owner-scoped task routes
server/models.js    Account and task schemas
server/passwords.js Salted scrypt helper with fixed teaching parameters
server/app.test.js  Route tests using model doubles, plus password checks
client/src/api.js   JSON request helper and CSRF token handling
client/src/main.jsx React account forms, session restoration, and task actions

CHECKS
In server: npm test
In client: npm run build
These checks do not replace live MongoDB and browser testing.

MANUAL LIVE CHECKLIST
- Register A; duplicate registration gets 409; wrong password gets 401.
- Sign in A, add a task, reload, toggle, reload; values persist.
- Sign in B in a separate browser profile or use lesson 4.13 PowerShell.
- B's list excludes A's task. B gets 404 for direct read, patch, and delete.
- Return to A and confirm B's rejected requests did not change the record.
- Missing/stale CSRF headers get 403; invalid inputs get 400.
- Logout clears the session; /me and /tasks then get 401.
- Inspect MongoDB: no plaintext password, unique email index, task owner,
  and session records. Do not share secret values from those records.
- Restart the API with the same secret and database; verify session behavior.
- Test keyboard navigation, visible labels, narrow layouts, and zoom.

LIMITATIONS
This is a local teaching reference, not a deploy-ready identity service.
It binds to loopback and has no production HTTPS or trust-proxy setup.
Production needs deliberate hosting, secure cookies, capacity planning,
shared rate limiting where applicable, secret management, and monitoring.
The simple limiter is per-process. Password hashing is memory intensive.
The list returns at most 100 tasks; add pagination for complete histories.
No password reset, authenticator/passkey enrollment, or all-device session revocation
is implemented. Registration conflict responses can reveal account existence.
The one-hour cookie setting is not a complete absolute-expiration policy.
Multi-tab session changes may require a reload to refresh the CSRF token.
No existing Module 3 records are migrated or assigned owners automatically.

Canvas assignments determine grading and due dates; these exercises add none.
