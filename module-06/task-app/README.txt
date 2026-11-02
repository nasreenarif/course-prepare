MODULE 6 TASK APP

EMAIL AUTHENTICATION
For the normal MongoDB app, read AUTH_SETUP.md and ../../docs/AUTHENTICATION.md.
Configure APP_ORIGIN, GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.
Register -> click the emailed verification link -> password -> emailed OTP.
Private tasks stay blocked until the OTP is accepted.
Verification link: 30 minutes; OTP: 5 minutes/5 attempts; resend: 60 seconds.
The normal server never prints verification links or OTPs.

Accessibility, responsive design, security, and registration verification.
Start with the Module 6 README and lessons 6.1–6.16 in Canvas.

REQUIREMENTS
Use Node.js 24.x and npm for the course examples. The full app needs a running
local MongoDB service or your approved Atlas database. Verify your deployment
with a compatible maintained runtime. Use an inbox you control and fictional task data.

LOCAL SETUP (PowerShell; begin in task-app)
  npm ci --prefix server
  npm ci --prefix client --include=dev
  if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
Generate a secret:
  node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
Put the generated value in SESSION_SECRET in server/.env.
Set MONGODB_URI to a separate practice database. The supplied URI assumes local
MongoDB is running and uses cs418_module6. No data migration is performed.
On macOS/Linux use cp instead of Copy-Item.

Terminal 1:
  cd server
  npm run dev
Expected: a JSON listening event on port 3000 after database connection.
Terminal 2 (start in task-app):
  cd client
  npm run dev
Open http://localhost:5173. Use localhost consistently rather than mixing it
with 127.0.0.1. Register, verify the emailed link, then sign in with password and emailed OTP; registration does not sign in for you.

CAPTCHA CONFIGURATION
Local defaults disable CAPTCHA and the registration screen explicitly says so.
To exercise the real provider, obtain a course-approved compatible v2
checkbox/siteverify key pair; see lessons 6.13 and 6.14. Configure server/.env:
  CAPTCHA_ENABLED=true
  RECAPTCHA_SITE_KEY=your-public-site-key
  RECAPTCHA_SECRET_KEY=your-private-secret
  RECAPTCHA_HOSTNAMES=localhost
Restart Express. /api/config returns the public site key; no client secret or
Vite environment variable is needed. Allow the same host in provider settings.
Production startup requires CAPTCHA_ENABLED=true and complete settings.
For deployment, use the exact deployed host(s), without schemes or ports.
This code targets compatible v2 checkbox/siteverify, not an Enterprise
assessment or v3 score/action contract. Check your key type and provider docs.
No keys, live provider registration, or service provisioning are included.

LOCAL CHECKS
From task-app:
  npm run check
This runs server tests, client helper tests, inherited booking practice tests,
and a Vite production build. Model doubles and provider/fetch fixtures do not
prove live database or provider integration.

BUILT-CLIENT REHEARSAL
Stop Vite. Run npm run build from client. Set SERVE_CLIENT=true and
NODE_ENV=development and APP_ORIGIN=http://localhost:3000 in server/.env; restart Express. Open http://localhost:3000.
The document now receives Express CSP/framing headers. Rebuild after client
changes. Restore SERVE_CLIENT=false and APP_ORIGIN=http://localhost:5173 for normal two-server development.
Local HTTP rehearsal does not verify HTTPS, HSTS, or production cookies.

HOSTED BUILD AND START (service root contains server/ and client/)
Set APP_ORIGIN to the public HTTPS origin. Set GMAIL_USER and GMAIL_APP_PASSWORD
as protected server variables; verify SMTP delivery from this host. See AUTH_SETUP.md.

Build: npm ci --prefix server --omit=dev && npm ci --prefix client --include=dev && npm run build --prefix client
Start: npm start --prefix server
Set NODE_ENV=production, SERVE_CLIENT=true, MONGODB_URI, SESSION_SECRET, and all
CAPTCHA settings in the host's secret configuration. TRUST_PROXY_HOPS=1 is only
appropriate if every request traverses exactly one trusted proxy; otherwise
review the topology and code. Read DEPLOYMENT_CHECKLIST.txt.

IMPORTANT CHANGES FROM MODULE 5
client/src/main.jsx       Skip link, public config, CAPTCHA and deletion flow
client/src/DeleteDialog.jsx Native modal, focus cycle and parent restoration
client/src/Captcha.jsx    Provider loading, expiry, errors, and reset lifecycle
client/src/style.css      Fluid layout, target sizes, focus and system preferences
server/security.js        CSP, framing, MIME, referrer, and production HSTS headers
server/captcha.js         Configuration and bounded fail-closed verification
server/module6.test.js    New security and verification regression tests

LIMITS
Test your database, hosted app, and live CAPTCHA configuration separately.
Complete your accessibility and security checks; local tests alone do not
establish conformance. CAPTCHA is on registration; login retains rate limiting.
Rate limits are per process. No password recovery or authenticator/passkey enrollment,
global session revocation, pagination, or persistent write idempotency is added.
Refresh unmounts the task form and clears its unsaved draft. Adapt deliberately.

SELF-STUDY PRACTICE
Run only the client and open http://localhost:5173/lab.html for the no-backend
lab. Read practice/SELF_STUDY_LAB.txt for steps and expected results. It includes
reusable labeled fields, error summary, contrast calculator, a scrollable table,
an actual informative image, and URL validation. The caption file is illustrative.
The delete dialog keeps its guarded aria-disabled buttons focusable while
a bounded request is pending; handlers, not ARIA alone, prevent activation.
