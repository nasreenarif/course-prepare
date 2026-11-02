MODULE 8 QUALITY PRACTICE

EMAIL AUTHENTICATION
For the normal MongoDB app, read AUTH_SETUP.md and ../../docs/AUTHENTICATION.md.
Configure APP_ORIGIN, GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.
Register -> click the emailed verification link -> password -> emailed OTP.
Private tasks stay blocked until the OTP is accepted.
Verification link: 30 minutes; OTP: 5 minutes/5 attempts; resend: 60 seconds.
The normal server never prints verification links or OTPs.

From task-app, first run npm ci --include=dev to install the pinned root lint tool.
Then install server/client dependencies using the commands below.
Run npm run check to include scoped ESLint and nine quality tests.
Read quality/LABS.txt, then run lab:debug and lab:release.
The filter is a standalone refactoring exercise, not a new Task App UI feature.
ESLint checks quality/*.mjs only. It does not claim full React/server lint coverage.
Earlier Module 6/7 templates are retained reference material. Use quality/ templates
for final evidence; Canvas remains authoritative for Milestone 3 requirements.
Module 8 uses its own default database and cookie. Use the public demo account
below for local memory practice. No earlier data is migrated.

MODULE 8 TASK APP
Verification, debugging, and release practice with the Task App.
Read Module 8 lessons 8.1–8.15. The Module 7 AI feature is retained for final review.

REQUIREMENTS
Use Node.js 24.x and npm for the course examples.
Use a maintained compatible runtime and verify it for your deployment.
No API key or MongoDB is needed for the disposable mock demo below.

PATH A -- LOCAL MEMORY DEMO (start in task-app)
  npm ci --prefix server
  npm ci --prefix client --include=dev
  npm run build --prefix client
  npm run demo --prefix server
Open http://localhost:3000. Sign in with this PUBLIC FICTIONAL practice account:
  Email: learner@example.test
  Password: Local study passphrase 7!
After entering these credentials, read the simulated OTP in this demo server's terminal and enter it in the code form. No email is sent by this demo.
Do not use this password for a real account. This account has no real data.
The server binds only to 127.0.0.1, ignores .env, forces mock AI, and rejects
NODE_ENV=production. Tasks, accounts and sessions disappear when it restarts.
The fixed mock plan never calls Gemini and is not live integration evidence.
Stop with Ctrl+C. Do not run two servers on port 3000 at once.

TRY THE FEATURE
1. Sign in and enter a fictional project goal in Task planning assistant.
2. Generate draft. Expect the mock label and three fixed practice steps.
3. Verify that no task was saved automatically.
4. Choose Use draft 1. It replaces the manual form's unsaved title and focuses it.
5. Edit the title, then choose Add task. Only now should one task appear.
6. Try blank input, a long goal, and a second request while one is pending.
The backend allows five valid AI requests per minute per account in one process.
Stop waiting cancels the browser wait, not guaranteed server/provider work.

PATH B -- NORMAL MONGODB APP
Install dependencies as above. Copy server/.env.example to server/.env:
  if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
On macOS/Linux use cp. Generate a random session secret:
  node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
Configure MONGODB_URI and SESSION_SECRET in server/.env. The default database is
cs418_module8 and the cookie is cs418.m8.sid. No previous data is migrated.
Terminal 1 from task-app/server: npm run dev
Terminal 2 from task-app/client: npm run dev
Open http://localhost:5173. Register, verify the emailed link, then sign in with password and emailed OTP. Use localhost consistently.
The normal server needs a running MongoDB service. Registration does not sign in.

AI MODES (normal server only; restart after changes)
AI_MODE=off     Reject generation safely; manual tasks remain available.
AI_MODE=mock    Fixed local fixture; no external calls. Forbidden in production.
AI_MODE=live    Calls Gemini generateContent from the server with your approved setup.
Live mode also needs GEMINI_API_KEY and GEMINI_MODEL in server/.env or the host's
secret settings. Use a course-approved Gemini text model supporting generateContent and
structured JSON output. The template selects gemini-3.5-flash-lite. No model access is assumed.
Never put the key in client code, VITE_ variables, logs, screenshots or Git.
Start with mock mode for local practice. Before using live mode, verify your
account, model access, output quality, latency, and resource policy. Record the
results of your own live checks separately from mock results.
Only the entered goal is sent; stored tasks and account email are not included.
Use fictional goals; review Google's current terms for your project tier.
Read GEMINI_SETUP.md in this task-app folder for the complete student setup,
optional live connection check, request/response explanation, and troubleshooting.
The local key/model configuration does not establish a data-retention guarantee.

CAPTCHA CONTINUITY
The normal local app defaults to CAPTCHA_ENABLED=false and visibly labels that
registration state. Production retains Module 6's required compatible v2
checkbox/siteverify configuration: CAPTCHA_ENABLED=true, RECAPTCHA_SITE_KEY,
RECAPTCHA_SECRET_KEY, and exact RECAPTCHA_HOSTNAMES. See Module 6 lessons 6.13-6.14.
The memory demo is not a provider/CAPTCHA integration test.

CHECKS (from task-app)
  npm run check
Runs server tests, client tests, practice tests, and both client entry builds.
  npm run evaluate:mock
Runs five fixed-output contract cases; does NOT evaluate live model quality.
Tests use controlled model/provider doubles. They do not prove real MongoDB,
live provider availability, public hosting or a full screen-reader experience.

BUILT-CLIENT REHEARSAL (normal server)
Build from client with npm run build. Stop Vite. Set SERVE_CLIENT=true and
NODE_ENV=development and APP_ORIGIN=http://localhost:3000 in server/.env; restart the server. Open localhost:3000.
Rebuild after source changes. Restore SERVE_CLIENT=false and APP_ORIGIN=http://localhost:5173 for Vite development.
The demo serves the built client automatically when dist exists.

HOSTING (service root contains server/, client/, shared/)
Set APP_ORIGIN to the public HTTPS origin. Set GMAIL_USER and GMAIL_APP_PASSWORD
as protected server variables; verify SMTP delivery from this host. See AUTH_SETUP.md.

Build: npm ci --prefix server --omit=dev && npm ci --prefix client --include=dev && npm run build --prefix client
Start: npm start --prefix server
Set NODE_ENV=production, SERVE_CLIENT=true, MONGODB_URI, SESSION_SECRET, CAPTCHA
settings, and AI_MODE=live or off. Set server key/model only for live mode.
Verify proxy topology before using TRUST_PROXY_HOPS=1. See DEPLOYMENT_CHECKLIST.txt.
Do not deploy demo.js. Quotas and concurrency guards are process-local.

KEY FILES
server/ai.js                Input/config validation, mock/live adapter, response parser
server/app.js               Protected AI route, account quota and in-flight guard
server/demo.js              Loopback-only disposable memory demo
server/ai.test.js           Provider, input, authorization, quota/concurrency tests
shared/plan.js              Public schema and pure plan validator
client/src/AIPlanner.jsx    Accessible draft UI, cancellation and manual review
client/src/TaskForm.jsx     Existing save flow with suggestion-copy support
practice/conversation.mjs   Optional bounded history exercise, NOT an active chat API
practice/evaluation-cases.json  Fictional quality-review cases
practice/AI_USE_LOG.txt and AI_EVALUATION_LOG.txt  Templates for recording your own evidence

MODULE 6 PRACTICE FOR REFERENCE
Revisit the optional accessibility lab at /lab.html; Vite needs no backend for
that page. Use the earlier booking, caption, accessibility, and milestone-2
templates for reference. Check Canvas for the current module's assignments.
The AIPlanner component provides the separate planning feature.

LIMITS
No automatic AI task saving, external tools, code execution, streaming, retrieval,
or stored chat history. No password recovery or authenticator/passkey enrollment, global
session revocation, distributed quotas, or exact spending cap is implemented.
Model output is untrusted advice. Human review and ordinary task validation remain.
Verify your live CAPTCHA, AI provider, database, and hosted app separately.
Record your accessibility/security observations and submit the required evidence
through Canvas.

For a built-client demo on a different port, set DEMO_PORT before startup.
The default is 3000; port 0 selects an available test port printed at startup.
The Vite proxy still expects port 3000 unless deliberately reconfigured.

PRACTICE LABS
From task-app: npm run lab:provider, npm run lab:budget, npm run lab:evaluation.
Read practice/SELF_STUDY_LABS.txt and PROMPT_WORKED_EXAMPLE.txt. These exercises
use only fixtures and hypothetical arithmetic; no paid API call is made.

MODULE 8 PRACTICE EXERCISES
Read quality/LABS.txt for lab:api and lab:lint with expected results.
The API example is complete and executable, but replaces MongoDB with model doubles.
Three async tests show awaited success and rejection without network calls.
npm run check includes the four expected lint-diagnostic cases.
quality/DATABASE_REHEARSAL.txt provides the separate real-database checklist.
Use quality/REVIEW_WORKED_EXAMPLES.txt to plan your reports, then record your own evidence.
