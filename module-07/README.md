# Module 7 — AI-assisted development and task planning

Add an optional protected planning assistant to the existing Task App. Validate the returned draft, show it to the user, and save only through the ordinary task form after review.

Use this complete example to trace the module concepts, run the exercises, and adapt the relevant features to your project. Read [course progression](../docs/COURSE_PROGRESSION.md) when building on earlier work. Use Node.js 24.x for these examples.


## Set up live Gemini

Start with the mock demo, then follow [Gemini setup for this module](task-app/GEMINI_SETUP.md). The guide walks you through Google AI Studio, a server-only key, the model setting, an optional standalone live check, and the full signed-in app. The `.env.example` keeps `AI_MODE=mock` by default so installing or testing this example does not call a paid service.

## Normal app setup

First complete [Gmail verification and OTP setup](task-app/AUTH_SETUP.md). Add `APP_ORIGIN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` to this module's server `.env`; keep your existing database/session settings. Reinstall server dependencies from the updated lockfile.

From the repository root:

```powershell
cd module-07/task-app
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Copy the template only on first setup. Edit `server/.env`: set `MONGODB_URI` to your own practice database and replace `SESSION_SECRET` with the output of:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `NODE_ENV=development` for local work. The example database is `cs418_module7`. [Database setup](../docs/DATABASE_SETUP.md) covers local MongoDB and Atlas. Accounts/data from other module databases are not copied automatically.

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
| `server/ai.js` | Input limits, mock/live provider adapter, timeout, and response validation. |
| `server/app.js and server/ai.test.js` | Authorization, per-account quota, in-flight guard, and failure tests. |
| `shared/plan.js` | Shared public plan schema and validator; retain this folder. |
| `client/src/AIPlanner.jsx` | Generate a draft, show feedback, cancel waiting, and copy a suggestion for review. |
| `practice/SELF_STUDY_LABS.txt` | Fixture-based provider, budget, and evaluation exercises. |

## Checks

From `task-app` after installing dependencies:

```powershell
npm run check
```

This runs server, client-helper, and practice tests plus a production client build. The root check package has no additional dependencies to install.

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

Continue with [Module 8](../module-08/README.md) after tracing and testing this checkpoint. Adapt changes into your own project rather than replacing its directory wholesale.

In the disposable memory demo only, enter the simulated OTP printed in the server terminal after submitting the public practice credentials. The normal MongoDB app sends real messages through the Gmail configuration above.
