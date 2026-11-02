MODULE 5 TASK APP

EMAIL AUTHENTICATION
For the normal MongoDB app, read AUTH_SETUP.md and ../../docs/AUTHENTICATION.md.
Configure APP_ORIGIN, GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.
Register -> click the emailed verification link -> password -> emailed OTP.
Private tasks stay blocked until the OTP is accepted.
Verification link: 30 minutes; OTP: 5 minutes/5 attempts; resend: 60 seconds.
The normal server never prints verification links or OTPs.

Validation, error handling, loading states, and a same-origin deployment path.

REQUIREMENTS
Use Node.js 24.x and npm for the course examples. Run a local MongoDB service
or configure your approved Atlas database for the full app. Test your deployment
with a maintained runtime that meets the package requirements.
Use an inbox you control, practice passphrases, fictional task data, and a separate database.

LOCAL DEVELOPMENT
Terminal 1, starting in task-app:
  cd server
  npm ci
  Copy-Item .env.example .env
On macOS/Linux use cp .env.example .env for the copy step.
Generate a random secret:
  node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
Put it in SESSION_SECRET in .env. Set MONGODB_URI to your practice database.
The example URI requires a running local MongoDB instance.
Then run:
  npm run dev
Expected: a JSON startup message with event listening and port 3000.

Terminal 2, starting in task-app:
  cd client
  npm ci --include=dev
  npm run dev
Open http://localhost:5173. Use localhost consistently.
Register, verify the emailed link, then sign in with password and emailed OTP. Registration does not automatically sign in.

TESTS
From server: npm test
From client: npm test
From client: npm run build
From task-app: npm run test:practice
From task-app: npm run check (runs all local tests and the client build)
The root package coordinates checks and has no additional dependencies.
Server route tests use controlled model doubles and an in-memory session store.
Client helper tests replace fetch. Neither proves live database integration.

LOCAL BUILT-CLIENT REHEARSAL
1. Stop Vite with Ctrl+C and run npm run build from client.
2. In server/.env set SERVE_CLIENT=true, NODE_ENV=development, and APP_ORIGIN=http://localhost:3000.
3. Restart with npm run dev from server.
4. Open http://localhost:3000 and repeat account and task checks.
5. Rebuild client after source edits; Express serves the dist snapshot.
Restore SERVE_CLIENT=false and APP_ORIGIN=http://localhost:5173 for the two-server development workflow.
This local HTTP rehearsal is not a production HTTPS verification.

HOSTING CONFIGURATION
Set APP_ORIGIN to the public HTTPS origin. Set GMAIL_USER and GMAIL_APP_PASSWORD
as protected server variables; verify SMTP delivery from this host. See AUTH_SETUP.md.

Repository/service root must contain server and client.
Build:
  npm ci --prefix server --omit=dev && npm ci --prefix client --include=dev && npm run build --prefix client
Start:
  npm start --prefix server
Environment: NODE_ENV=production, SERVE_CLIENT=true, MONGODB_URI, SESSION_SECRET.
Let the platform provide PORT. Configure TRUST_PROXY_HOPS only for the verified
ingress arrangement: 1 assumes exactly one trusted proxy on every request path.
The default 0 trusts none. Other topologies need an appropriate code change.
Health check: /api/health
Read lessons 5.11–5.14 and DEPLOYMENT_CHECKLIST.txt before deploying.
Configure your own approved hosting service and practice database when deploying.

IMPORTANT FILES
server/validation.js  Request allowlist, title and boolean rules, field errors
server/errors.js      AppError and central safe error responses
server/app.js         Sessions, CSRF, permissions, health route, static routing
server/server.js      Configuration, database startup, listener, shutdown
client/src/api.js     Response parsing, error categories, timeouts, cancellation
client/src/contracts.js  Endpoint response-shape checks and safe field messages
practice/booking-validation.mjs  Optional related-field validation exercise
scripts/check.mjs     Local release checks; optional CI template is in practice/
client/src/TaskForm.jsx  Controlled title, field feedback, submission guard
client/src/main.jsx   Account flow, explicit load states, mutation coordination
client/src/ErrorBoundary.jsx  Render-failure fallback

MODULE 4 CONTINUITY
Core account/password/ownership behavior is retained. The default database is
cs418_module5 and the cookie name is cs418.m5.sid. No data migration occurs.
Use this as a complete reference; do not overwrite a custom Module 4 project
without comparing its fields and routes. See CHANGE_MAP.txt.

LIMITS
This is a teaching reference, not a complete production identity service.
No password recovery, authenticator/passkey enrollment, or all-device revocation.
Rate limits are per process. List results are capped at 100 without pagination.
No automatic write retries or persistent idempotency-key implementation.
Refreshing the list unmounts the form and clears unsaved draft input.
Model-double and intercepted-browser tests do not prove real MongoDB or hosting.
Production still requires topology-specific configuration, operational review,
capacity planning, database backups, and live smoke testing.
