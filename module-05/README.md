# Module 5 — Validation, error handling, and deployment

Retain the account/task flow while improving input rules, response contracts, safe errors, loading states, cancellation, and a built-client deployment path.

Use this complete example to trace the module concepts, run the exercises, and adapt the relevant features to your project. Read [course progression](../docs/COURSE_PROGRESSION.md) when building on earlier work. Use Node.js 24.x for these examples.

## Normal app setup

First complete [Gmail verification and OTP setup](task-app/AUTH_SETUP.md). Add `APP_ORIGIN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` to this module's server `.env`; keep your existing database/session settings. Reinstall server dependencies from the updated lockfile.

From the repository root:

```powershell
cd module-05/task-app
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Copy the template only on first setup. Edit `server/.env`: set `MONGODB_URI` to your own practice database and replace `SESSION_SECRET` with the output of:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `NODE_ENV=development` for local work. The example database is `cs418_module5`. [Database setup](../docs/DATABASE_SETUP.md) covers local MongoDB and Atlas. Accounts/data from other module databases are not copied automatically.

Terminal 1, starting in `task-app`:

```powershell
cd server
npm run dev
```

Terminal 2, also starting in `task-app`:

```powershell
cd client
npm run dev
```

Open `http://localhost:5173`. Register with an email inbox you can open and a practice passphrase of 15–128 characters. Click the verification link, then enter your email/password and the emailed OTP to sign in. Registration does not sign you in automatically. Add, toggle, and delete a task; reload to verify persistence. Sign in as another account in a separate browser profile and verify it cannot access the first account's tasks.

The Vite proxy forwards relative `/api` calls to Express on port 3000. Run only one module's servers at a time and use `localhost` consistently.

## Code to study

| Location inside `task-app` | What to trace |
| --- | --- |
| `server/validation.js and server/errors.js` | Allowed fields, predictable field errors, safe status/code mapping. |
| `client/src/api.js and client/src/contracts.js` | Validate response shapes, classify failures, and bound request waits. |
| `client/src/TaskForm.jsx and ErrorBoundary.jsx` | Guard submissions, preserve clear feedback, and handle render failures. |
| `server/server.js and scripts/check.mjs` | Startup/shutdown and repeatable checks. |
| `CHANGE_MAP.txt and DEPLOYMENT_CHECKLIST.txt` | Compare Module 4 and rehearse release configuration. |

## Checks

From `task-app` after installing dependencies:

```powershell
npm run check
```

This runs server, client-helper, and practice tests plus a production client build. The root check package has no additional dependencies to install.

## Built-client rehearsal

Build the client, stop Vite, set `SERVE_CLIENT=true` in `server/.env`, and restart the local server. Open `http://localhost:3000`: Express now serves the built client and API together. Rebuild after source changes. Restore `SERVE_CLIENT=false` to return to two-server development. This HTTP rehearsal does not prove production HTTPS or cookie configuration.

## Boundaries and next steps

Tests use controlled doubles/fixtures; complete the live database and two-account checks above separately. They do not prove public hosting, external providers, or a complete accessibility/security audit. The app includes Gmail verification links and email-based two-step login. Password recovery and authenticator/passkey enrollment are separate extensions. The continuity exercises remain isolated concept models; the integrated workflow is in `task-app/server/auth.js` and `identity.js`.

Read [task-app/README.txt](task-app/README.txt) for additional setup guidance, manual checks, limitations, and deployment/practice exercises. Use the numbered lessons in Canvas for the corresponding explanations, assignment requirements, and grading criteria.

Continue with [Module 6](../module-06/README.md) after tracing and testing this checkpoint. Adapt changes into your own project rather than replacing its directory wholesale.
