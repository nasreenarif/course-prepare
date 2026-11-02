# Module 7 — Gmail verification and login OTP

Read the [step-by-step authentication guide](../../docs/AUTHENTICATION.md) before starting the normal MongoDB app.

The flow is: **register → click the emailed verification link → enter email/password → enter the emailed OTP → access tasks**.

In this module's `server/.env`, keep your database/session settings and add:

```dotenv
APP_ORIGIN=http://localhost:5173
GMAIL_USER=your-own-sender@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

Replace the placeholders with your own sender configuration. Use a Google App Password, not your normal Gmail password. The full guide explains Google 2-Step Verification, local/hosted URLs, resend behavior, errors, and the distinction between email verification and login OTP.

From this `task-app` folder, run `npm ci --prefix server --include=dev` after updating the examples. Restart the server after editing `.env`. Do not overwrite an existing `.env` with the template.

Verification links expire after 30 minutes. Login codes expire after five minutes, permit five attempts, and can be resent after 60 seconds. Tests capture messages locally and never contact Gmail. Use an inbox you control for the normal app; fictional `.test` addresses are for fixtures only.

Follow [the module README](../README.md) for the database, frontend, and run commands. Modules 7–8's separate memory demo prints simulated emails in its terminal; it is not Gmail-delivery evidence.
