# Module 4 — React, accounts, and owner-scoped tasks

Connect a React UI to an Express API, restore a session, protect state-changing requests with a CSRF token, and restrict task access to the authenticated owner.

Use this complete example to trace the module concepts, run the exercises, and adapt the relevant features to your project. Read [course progression](../docs/COURSE_PROGRESSION.md) when building on earlier work. Use Node.js 24.x for these examples.

## Normal app setup

First complete [Gmail verification and OTP setup](task-app/AUTH_SETUP.md). Add `APP_ORIGIN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` to this module's server `.env`; keep your existing database/session settings. Reinstall server dependencies from the updated lockfile.

From the repository root:

```powershell
cd module-04/task-app
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Copy the template only on first setup. Edit `server/.env`: set `MONGODB_URI` to your own practice database and replace `SESSION_SECRET` with the output of:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `NODE_ENV=development` for local work. The example database is `cs418_module4`. [Database setup](../docs/DATABASE_SETUP.md) covers local MongoDB and Atlas. Accounts/data from other module databases are not copied automatically.

Terminal 1, starting in `task-app`:

```powershell
cd server
npm start
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
| `server/app.js` and `server/auth.js` | Middleware, email verification, pending OTP login, session checks, CSRF, and owner-scoped CRUD. |
| `server/models.js and server/passwords.js` | Account/task schemas and salted password hashing. |
| `client/src/api.js` | Same-origin requests and CSRF token handling. |
| `client/src/main.jsx` | Controlled account forms, session restoration, and task state updates. |
| `practice/` | Pure array updates, priority rules, password/permission demonstrations. |

## Checks

From `task-app` after installing dependencies:

```powershell
npm test --prefix server
npm run build --prefix client
node --test practice/practice.test.mjs
```

Run the separate continuity exercises from the module folder:

```powershell
cd ../continuity-labs
node --test contract-bridge.test.mjs identity-state.test.mjs
```

These 11 continuity tests need no packages, database, email delivery, or real factor. `contract-bridge.mjs` explains the Module 3/4 API mismatch. `identity-state.mjs` demonstrates hashed email-token and pending-MFA state transitions. Its injected factor verifier is a test fixture, not TOTP/WebAuthn.

The app includes Gmail verification links and email-based two-step login. Password recovery and authenticator/passkey enrollment are separate extensions. The continuity exercises remain isolated concept models; the integrated workflow is in `task-app/server/auth.js` and `identity.js`. No Module 3 records are migrated or assigned an owner automatically.

## Boundaries and next steps

Tests use controlled doubles/fixtures; complete the live database and two-account checks above separately. They do not prove public hosting, external providers, or a complete accessibility/security audit. The app includes Gmail verification links and email-based two-step login. Password recovery and authenticator/passkey enrollment are separate extensions. The continuity exercises remain isolated concept models; the integrated workflow is in `task-app/server/auth.js` and `identity.js`.

Read [task-app/README.txt](task-app/README.txt) for additional setup guidance, manual checks, limitations, and deployment/practice exercises. Use the numbered lessons in Canvas for the corresponding explanations, assignment requirements, and grading criteria.

Continue with [Module 5](../module-05/README.md) after tracing and testing this checkpoint. Adapt changes into your own project rather than replacing its directory wholesale.
