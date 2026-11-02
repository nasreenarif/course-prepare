# Module 8 — Verification, debugging, and release readiness

Keep Module 7’s working app and build evidence for its behavior: requirements/risk checks, unit and route tests, linting, debugging, and release decisions.

Use this complete example to trace the module concepts, run the exercises, and adapt the relevant features to your project. Read [course progression](../docs/COURSE_PROGRESSION.md) when building on earlier work. Use Node.js 24.x for these examples.


## Set up live Gemini

Start with the mock demo, then follow [Gemini setup for this module](task-app/GEMINI_SETUP.md). The guide walks you through Google AI Studio, a server-only key, the model setting, an optional standalone live check, and the full signed-in app. The `.env.example` keeps `AI_MODE=mock` by default so installing or testing this example does not call a paid service.

## Normal app setup

First complete [Gmail verification and OTP setup](task-app/AUTH_SETUP.md). Add `APP_ORIGIN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` to this module's server `.env`; keep your existing database/session settings. Reinstall server dependencies from the updated lockfile.

From the repository root:

```powershell
cd module-08/task-app
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
npm ci --include=dev
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Copy the template only on first setup. Edit `server/.env`: set `MONGODB_URI` to your own practice database and replace `SESSION_SECRET` with the output of:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `NODE_ENV=development` for local work. The example database is `cs418_module8`. [Database setup](../docs/DATABASE_SETUP.md) covers local MongoDB and Atlas. Accounts/data from other module databases are not copied automatically.

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
| `quality/` | Quality exercises, async regression tests, debug/release/lint demonstrations. |
| `server/quality-flow.test.js` | API-level acceptance and failure-flow tests. |
| `eslint.config.mjs and package.json` | Configured lint scope and commands; lint does not cover every app file. |
| `scripts/check.mjs` | Repeatable quality tests, server/client/practice tests, and build. |
| `shared/, client/, server/, practice/` | Retained app, AI feature, and earlier exercises. |

## Checks

From `task-app` after installing dependencies:

```powershell
npm run check
```

This runs the configured `quality` lint scope, four intentional lint examples, quality tests, server/client/practice tests, and a production client build. Root `npm ci --include=dev` is required here because Module 8 adds ESLint; the server/client installs alone are insufficient.

For focused practice, run `npm run test:quality`, `npm run lab:debug`, `npm run lab:release`, or `npm run lab:api`. `lab:lint` prints expected lint failures for deliberately broken examples and checks that they are detected; those expected diagnostics are part of a passing lab.

## Quick memory demo — no database or API key

From `task-app`, install the server/client dependencies as above, then:

```powershell
npm run build --prefix client
npm run demo --prefix server
```

Open `http://localhost:3000`. Sign in with the **public fictional demo account**:

- Email: `learner@example.test`
- Password: `Local study passphrase 7!`

These are published demo values, not real credentials. The demo binds to loopback, ignores `.env`, forces mock AI, and rejects production mode. All accounts, tasks, and sessions disappear when it stops. Stop any normal API first to free port 3000.

Enter a fictional goal in the planning assistant. Generate a draft: expect the mock label and three fixed steps. No task is automatically saved. Choose Use draft 1, edit the copied title, then Add task to save it. “Stop waiting” cancels the browser wait; it does not guarantee that provider work stopped.

Run `npm run evaluate:mock` for five fixed-fixture contract cases. It is not a measurement of live model quality. The normal MongoDB app supports `AI_MODE=off`, `mock`, or `live`; live mode uses Google Gemini and requires `GEMINI_API_KEY` and `GEMINI_MODEL` in `server/.env`. Keep keys out of the client and `VITE_` variables. Follow the [Gemini setup guide](task-app/GEMINI_SETUP.md) for key creation, model choice, a connection check, and troubleshooting. No paid call is needed for local checks.

## Accessibility lab and CAPTCHA

To study the retained accessibility lab without MongoDB, run only the client and open `http://localhost:5173/lab.html`. Follow `task-app/practice/SELF_STUDY_LAB.txt`. The lab covers labeled fields/error feedback, contrast, responsive tables, image alternatives, and URL validation. Earlier exercises retained here are practice, not additional graded assignments.

The normal app disables CAPTCHA locally and visibly labels that state. Enabling it requires compatible v2 checkbox/siteverify keys and exact permitted hostnames; see `task-app/README.txt`. Production startup requires CAPTCHA configuration. Mock/memory checks do not verify a live provider.

## Boundaries and next steps

Tests use controlled doubles/fixtures; complete the live database and two-account checks above separately. They do not prove public hosting, external providers, or a complete accessibility/security audit. The app includes Gmail verification links and email-based two-step login. Password recovery and authenticator/passkey enrollment are separate extensions. The continuity exercises remain isolated concept models; the integrated workflow is in `task-app/server/auth.js` and `identity.js`.

Read [task-app/README.txt](task-app/README.txt) for additional setup guidance, manual checks, limitations, and deployment/practice exercises. Use the numbered lessons in Canvas for the corresponding explanations, assignment requirements, and grading criteria.

Use the verification results to decide what is ready and what still needs evidence. A green local check is one input to the release decision; real database/provider/hosting checks remain separate.

In the disposable memory demo only, enter the simulated OTP printed in the server terminal after submitting the public practice credentials. The normal MongoDB app sends real messages through the Gmail configuration above.
