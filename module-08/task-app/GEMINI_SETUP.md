# Module 8 — Set up Google Gemini

Use this guide to connect your Task App to the Gemini API. Begin with the mock exercises so you can understand the request flow before using your own API key. Keep your existing task validation, account sessions, CSRF checks, and ownership rules as you add the planning feature.

## Choose the mode you need

| Mode | Command or setting | What you need | What happens |
| --- | --- | --- | --- |
| Memory demo | `npm run demo --prefix server` | Installed server/client dependencies and a client build | Uses fixed mock suggestions. Ignores `.env`. No MongoDB or Gemini call. Data resets on restart. |
| Normal app with mock AI | `AI_MODE=mock`, then start the server with `npm run dev` | MongoDB/Atlas and a session secret | Accounts/tasks persist; draft plans are fixed local fixtures. |
| Normal app with live Gemini | `AI_MODE=live`, then start the server with `npm run dev` | MongoDB/Atlas, session secret, Gemini key, available model | Sends the entered goal to Gemini and validates the returned draft. |
| AI disabled | `AI_MODE=off` | Normal app configuration | Manual tasks still work; generation is unavailable. |

The environment template defaults to mock mode. `npm run check`, `npm run lab:provider`, and `npm run evaluate:mock` use controlled fixtures and do not call Gemini. The optional `gemini:smoke` command below makes **one live request**.

## 1. Install the example

Use Node.js 24.x. From the course repository root:

```powershell
cd module-08/task-app
npm ci --include=dev
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
```

Stay in this `task-app` folder for the commands below. PowerShell users can use `npm.cmd` if their execution policy blocks `npm.ps1`. Each module has its own configuration; stop the other module's servers before switching because both use port 3000.

For the no-key demo, run:

```powershell
npm run build --prefix client
npm run demo --prefix server
```

Open `http://localhost:3000`. Use the public fictional account `learner@example.test` with passphrase `Local study passphrase 7!`. Enter the simulated login OTP printed in the demo server terminal, then generate a draft and observe the mock label. Stop the demo with Ctrl+C before starting the normal app. Editing `.env` cannot turn this memory demo into a live provider connection.

## 2. Get your Gemini API key

Open [Google AI Studio's API key page](https://aistudio.google.com/app/apikey), sign in with your course-approved Google account, and create or select a project and API key. Keep the key private. If your school-managed account cannot create a key or access a project, contact me through Canvas and continue with mock mode while access is resolved. See Google's [key setup instructions](https://ai.google.dev/gemini-api/docs/api-key).

This example uses the Gemini Developer API from your Node server. A Gemini chat subscription is not the configuration for this app: use an API key and the quota shown for its project. Review the model's current [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) before making live requests. A free tier has limits; access and quota can differ by project and model.

## 3. Configure your server environment

Create the local file only if it does not already exist:

```powershell
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

On macOS/Linux, use `cp server/.env.example server/.env` only on first setup. Edit the existing file when you already have database settings. In `server/.env`, set:

```dotenv
AI_MODE=live
GEMINI_API_KEY=paste-your-own-key-here
GEMINI_MODEL=gemini-3.5-flash-lite
```

Replace the key placeholder with your actual key. The example selects `gemini-3.5-flash-lite`, a text model with structured output support listed in Google's [model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite). Confirm that it is available in your own project. If it is unavailable, use the course-approved replacement from the [current model list](https://ai.google.dev/gemini-api/docs/models) that supports `generateContent` and structured JSON output. Enter a model ID, not a web address. A leading `models/` is accepted and removed by the server.

Keep these settings in `server/.env` or your hosting service's server secret settings. Do not use a `VITE_` prefix, paste the key into React, commit `.env`, or send me your key. The code reads `GEMINI_API_KEY` explicitly; a different SDK's environment-variable alias does not configure this example. If you have an older local configuration, add these Gemini settings while preserving your database/session settings. Unused provider variables can be removed locally.

Use fictional goals with no passwords, API keys, personal records, or private project data. Google describes different data-use terms for free and paid service tiers; review the terms linked from its pricing page. A local environment file does not control the provider's data-retention policy.

## 4. Check Gemini separately from MongoDB

Once your key, model, and quota are ready, run this optional check from `task-app`:

```powershell
npm run gemini:smoke --prefix server
```

This sends one fixed fictional goal to Gemini. It may consume quota or incur a charge on a paid project. It needs `AI_MODE=live` and the Gemini settings in `server/.env`, but **does not connect to MongoDB, start a web server, or save tasks**. The key and returned plan are not printed.

On success, expect a message beginning `Gemini live check passed`, followed by the selected model, prompt version, and number of accepted steps. If it fails, use the error code and the troubleshooting table below. This isolates provider access from database or sign-in problems. A successful provider check still needs the browser workflow in the next step.

## 5. Run the full app

The normal app also requires Gmail settings from [AUTH_SETUP.md](AUTH_SETUP.md), plus these settings in `server/.env`:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/cs418_module8
SESSION_SECRET=replace-with-your-generated-secret
NODE_ENV=development
SERVE_CLIENT=false
CAPTCHA_ENABLED=false
```

The example MongoDB URI assumes you have a local server running. If you use Atlas, substitute your private application connection string and a practice database. Connecting the VS Code MongoDB extension alone does not configure this app. Follow [database setup](../../docs/DATABASE_SETUP.md) for either option.

Generate a session secret with this command and put its output in `SESSION_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start two terminals, both initially in `module-08/task-app`:

```powershell
# Terminal 1
npm run dev --prefix server
```

```powershell
# Terminal 2
npm run dev --prefix client
```

Use `npm run dev` for the local server so Node loads `server/.env`. The normal `npm start` command expects variables from a hosting environment. Restart the server after changing `.env` and reload your browser to refresh the displayed mode.

For the normal app, also complete [Gmail authentication setup](AUTH_SETUP.md). Open `http://localhost:5173`, register with an inbox you control, click the verification link, and sign in with your password followed by the emailed OTP. The public demo account belongs to the disposable memory demo; it is not automatically created in your MongoDB database. Confirm that the planner says **Live Gemini mode**.

Try this goal: `Plan a small study checklist app with a title field and a completed checkbox.` Generate a draft, read its suggestions, and confirm that your task list has not changed. Select **Use draft 1**, edit the title, and then choose **Add task**. Only that final action saves the task. Gemini does not receive your stored task list or account email; the request contains the entered goal plus the fixed planning instructions and output schema.

## 6. Understand the code path

`client/src/AIPlanner.jsx` sends `{ goal }` to your Express `/api/ai/plans` route. The route checks the session, CSRF token, goal, per-account quota, and in-flight request before calling `server/ai.js`. The key stays on the server.

The adapter uses Node's built-in `fetch`; you do not need another SDK package. It posts to the Gemini `models/...:generateContent` endpoint with an `x-goog-api-key` header. Its `systemInstruction` describes the task, and `contents` carries the goal as data. `generationConfig.responseFormat.text` requests JSON matching `shared/plan.js`. See the [Gemini REST reference](https://ai.google.dev/api/generate-content) for these fields.

The request asks for one candidate, caps output at 4,096 tokens, and allows 20 seconds for the server request/body read. The browser allows 25 seconds so it can receive a server timeout response. These limits bound waiting and output; they are not an exact spending cap. There is no automatic retry, tool execution, search grounding, or automatic saving.

`readResponse` checks prompt blocking and the candidate's finish reason, ignores thought parts, joins answer text parts, and parses the JSON. Only a `STOP` result with a valid plan is accepted. A token-limit stop, blocked response, malformed JSON, extra fields, or invalid field lengths rejects the draft. The response schema helps with structure; your application's validator and your own review remain necessary.

## 7. Practice failures and record your results

From `task-app`, run:

```powershell
npm run check
npm run lab:provider
npm run evaluate:mock
```

The provider lab contains 13 simulated Gemini cases, including success, prompt/candidate blocking, truncation, invalid JSON, missing candidates, quota, configuration, network, and timeout failures. It exercises the same adapter with injected responses and makes no external request. The mock evaluator checks fixed fixtures; it does not measure live model quality.

| Symptom or code | What to check |
| --- | --- |
| The app still says mock | Stop `npm run demo`; use the normal server with `npm run dev`, set `AI_MODE=live` in that module's `server/.env`, restart, and reload. |
| Startup mentions `GEMINI_API_KEY` | Replace the placeholder or blank value with your own key. Keep it on one line and never print it while debugging. |
| Startup mentions `GEMINI_MODEL` | Use an available model ID, not a URL; check spelling and surrounding spaces. |
| `AI_CONFIGURATION` | Check the key's project/API permissions, model availability, account/region access, and request compatibility. Provider HTTP 400/401/403/404 maps to this safe code. |
| `AI_BUSY` | Gemini returned a quota/rate-limit response. Check project usage and wait before retrying. Creating another key in the same project does not create a new quota. |
| `AI_RATE_LIMIT` | The app's separate five-requests-per-minute limit for your account was reached. Wait before generating again. |
| `AI_IN_PROGRESS` | A request for this account is still running. Let it finish before submitting another goal. |
| `AI_REFUSED` | The provider blocked the prompt or candidate. Revise the goal or continue manually; do not disable safety checks. |
| `AI_INCOMPLETE` | Generation did not finish normally, including hitting the token limit. Try a smaller, clearer goal; do not accept a partial plan. |
| `AI_FORMAT` | The response was unreadable or failed the plan contract. Verify the chosen model supports the configured structured output; keep validation enabled. |
| `AI_TIMEOUT` or `AI_UNAVAILABLE` | Check connectivity/provider status and retry later. Avoid repeated clicks. |
| MongoDB/session startup error | Resolve the database URI or session secret separately; successful Gemini access does not configure either one. |

“Stop waiting” cancels the browser wait. It does not guarantee that the provider stopped processing or charging for a request. Manual task entry remains available if generation fails.

Record the exact model, prompt version, project revision, expected/actual results, and whether each check used fixtures or a live provider. Use `practice/AI_EVALUATION_LOG.txt` for your observations. Follow Canvas for what to submit; do not claim a live integration based only on mock results.

## Hosting

Set `GEMINI_API_KEY`, `GEMINI_MODEL`, and `AI_MODE=live` or `off` in your host's server environment. Complete the database/session/HTTPS settings and Module 6's required production CAPTCHA configuration in `DEPLOYMENT_CHECKLIST.txt`. Do not deploy the memory demo or expose your key through a frontend build variable.
