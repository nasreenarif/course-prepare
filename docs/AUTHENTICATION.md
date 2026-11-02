# Email verification and sign-in codes

Use this guide with the Task App in Modules 4–8. I use **Nodemailer with Gmail** for two separate steps:

1. **Register:** create an account and receive an email containing a verification link.
2. **Verify the address:** click the link. The server marks the address as verified and returns you to the sign-in page.
3. **Sign in:** enter your email and password. The server emails a six-digit one-time password (OTP).
4. **Complete sign-in:** enter that OTP in the same browser. Only then can you see or change private tasks.

Verifying the email does not sign you in. Entering the correct password alone does not sign you in either. These separate steps are the main idea to trace through the code.

## 1. Understand the two email addresses

The **sender** is the Gmail account your Node server uses to send messages. The **recipient** is the email address entered into the registration form. They may be the same address while you practice. A recipient can use another email provider; only the sender in this example uses Gmail.

Configure your own sender for your local copy. You do not need my Gmail password, and you should not share yours. Use an inbox you can open for registration, a practice password for the Task App, and fictional task data. Addresses ending in `.test` in automated tests are fictional and cannot receive real messages.

## 2. Prepare the Gmail sender

1. Open your [Google Account security settings](https://myaccount.google.com/security) and enable Google's **2-Step Verification** if it is not already enabled.
2. Open [App Passwords](https://myaccount.google.com/apppasswords), create one for this practice application, and copy the generated 16-character value into your local environment file in the next step.
3. Use this **App Password**, not your ordinary Gmail password, for Nodemailer. Google's own 2-Step Verification protects the sender account; it is separate from the OTP feature you are building for your Task App.

Some school-managed accounts do not offer App Passwords. If the option is unavailable, follow the course's account policy and contact me through Canvas for an approved sender option. The automated tests still run without a Gmail account. See [Google's App Password instructions](https://support.google.com/accounts/answer/185833).

This is the simple classroom setup. Nodemailer also supports OAuth 2.0. Gmail may restrict automated delivery or reject a connection from a hosting service; do not assume local delivery proves hosted delivery. See the [Nodemailer Gmail guide](https://nodemailer.com/guides/using-gmail).

## 3. Add three settings to the server environment

Open the module's `task-app/server/.env`. If the file does not exist, run this **from that module's `task-app` folder**:

```powershell
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Keep your existing MongoDB, session, CAPTCHA, and Gemini settings. Add or edit:

```dotenv
APP_ORIGIN=http://localhost:5173
GMAIL_USER=your-own-sender@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

Replace the placeholders. `GMAIL_APP_PASSWORD` is not a literal phrase to copy unchanged. The configuration removes spaces if Google displays the password in groups. Keep the value in the server `.env` file; `.gitignore` excludes that file. Share `.env.example`, which contains no working credentials. Never prefix either Gmail credential with `VITE_`: Vite exposes those variables to browser code.

| Setting | Meaning |
| --- | --- |
| `GMAIL_USER` | The sender account used by Nodemailer. |
| `GMAIL_APP_PASSWORD` | The sender's Google App Password. It is unrelated to a student's Task App password or OTP. |
| `APP_ORIGIN` | The browser address that receives verification links. Use `http://localhost:5173` with Vite; use `http://localhost:3000` when serving the built client locally; use your HTTPS site origin after deployment. Do not append `/api` or another path. |

Keep `MONGODB_URI` and a generated `SESSION_SECRET` configured as explained in the module README. The session secret also protects the stored OTP digest. Restart the server whenever environment settings change.

## 4. Install dependencies and start the app

From the module's `task-app` folder:

```powershell
npm ci --prefix server --include=dev
npm ci --prefix client --include=dev
```

The server lockfile includes Nodemailer. You do not need to install it globally or change the provided package versions.

Start two terminals, both initially in `task-app`:

```powershell
# Terminal 1: Module 4
npm start --prefix server
```

```powershell
# Terminal 1: Modules 5–8 instead
npm run dev --prefix server
```

```powershell
# Terminal 2: all five modules
npm run dev --prefix client
```

Module 4's start script loads `.env`. Modules 5–8 use the dev script to load `.env`; their production start script expects hosting environment variables. Run one module at a time and open `http://localhost:5173`.

## 5. Register and verify your email

Choose **Need an account?**, enter an email inbox you can open and a practice passphrase of 15–128 characters, then select **Register and send verification link**. In Modules 6–8, also complete CAPTCHA when it is enabled.

Open the new email and click its link on the same computer running the local servers. The browser returns to the app and reports that the email is verified. You are still signed out. A `localhost` link opened on your phone points to your phone, not your development computer.

The link expires after **30 minutes** and can be used once. To get another link, use the sign-in form: enter the account's email and password, then select **Resend verification link**. Wait at least **60 seconds** between requests. A new link replaces the previous one.

If registration saved the account but email delivery failed, use this resend action after correcting the Gmail setup. Registering the same address again returns an account-conflict error because the account already exists. If an email-security scanner already opened the link, a later click can say it was already used; try signing in to determine whether verification succeeded.

## 6. Sign in with the emailed OTP

Enter the verified address and password, then select **Send login code**. The app shows the code form, but private tasks remain unavailable. Open the new email, copy the six digits, and select **Verify code and sign in** in the browser where you entered the password. Preserve a leading zero if there is one.

- Each OTP expires after **five minutes** and allows at most **five incorrect/correct comparison attempts** in total.
- You can request another code after **60 seconds**. Only the current challenge for that account works; starting a newer login can invalidate an earlier attempt in another browser.
- Refreshing the page restores an unexpired pending code form. It does not extend the code's expiry.
- After expiry, select **Start again** and enter the password again. **Start again** cancels this browser's pending session.
- A successful code is consumed once. The server creates a fresh authenticated session and CSRF token. Signing out destroys that session.

Do not send a code in a URL, store it in localStorage, or put it into a project commit. The normal Gmail server does not print verification links or OTPs to the terminal.

## 7. Trace the files in order

| File inside `task-app` | What to learn |
| --- | --- |
| `server/email.js` | Read server configuration; create a Gmail Nodemailer transport; send plain-text messages. |
| `server/models.js` | Store `emailVerifiedAt`, token/code digests, expiry times, resend times, and an OTP attempt count. |
| `server/identity.js` | Create random links/codes, enforce expiry and cooldown, and consume challenges with conditional database updates. |
| `server/auth.js` | Register, verify email, resend, start login, verify OTP, guard private routes, and log out. |
| `server/app.js` | Run session, CSRF, rate-limit and authentication middleware before private task routes. |
| `client/src/AuthPanel.jsx` | Switch between account details and the pending OTP form and explain failures. |
| `server/auth.test.js` | Exercise links, delivery failures, incorrect/expired/reused codes, concurrent requests, and denied private access. |

The verification link contains a long random secret. MongoDB stores its SHA-256 digest rather than the original link token. An OTP has only six digits, so its digest uses HMAC with a server secret; plain hashing alone would make guessing every six-digit value too easy after a database leak. Neither mechanism replaces the separate password hashing from lesson 4.4.

The database update includes conditions such as “not expired” and “challenge matches.” A successful consume clears the stored challenge. This matters because two requests can arrive together: checking in one request and deleting much later could allow both to succeed. OTP attempt increments and successful consumption use conditional updates.

## 8. Check your own result

Run `npm test --prefix server` from `task-app`. The tests capture messages in memory and do not contact Gmail, require credentials, or charge a provider. They exercise real Express routes with controlled data models. They are not proof of your MongoDB or SMTP configuration.

Then verify the real app manually:

1. Register a fresh practice account; confirm that it cannot sign in before clicking the link.
2. Click the link and confirm verification. Click it again and confirm it is no longer accepted as a new verification.
3. Enter the correct password; confirm that tasks remain unavailable before the OTP.
4. Try an incorrect OTP, then the correct code. Confirm that private tasks appear only after completion.
5. Sign out and confirm that private requests are denied. Test a second account in a separate browser profile to check task ownership.
6. Record expiry, resend, failed-delivery, and restart results. After restarting the normal app, MongoDB should retain the verified account and tasks.

Older practice accounts are not marked verified automatically. Use **Resend verification link** with the existing password. Existing password-only sessions must sign in again and complete an OTP. This update does not delete or migrate tasks.

## 9. Troubleshoot one layer at a time

| Symptom | What to check |
| --- | --- |
| Startup asks for Gmail settings | Edit the current module's server `.env`, replace placeholders, and use the script that loads that file. |
| Gmail rejects authentication | Confirm the sender, Google 2-Step Verification and App Password. A normal Gmail password will not configure this example. |
| No email arrives | Check Spam, sender/account restrictions, network access to Gmail SMTP, and the server's safe error message. Avoid repeatedly resending. |
| Link opens the wrong page | Check `APP_ORIGIN`, keep both development servers running, and open local links on the development computer. |
| Link is invalid or already used | Use the newest link. If it was already opened, try signing in; otherwise request a replacement. |
| Code is rejected | Use the newest six-digit code in the original pending browser session. After five attempts or five minutes, request a replacement or start again. |
| Account already exists after failed mail | Use the existing credentials with **Resend verification link**. Do not delete the database to retry. |
| Gemini mock mode is enabled | The normal app still uses Gmail for accounts. Gemini mode changes the planner, not authentication. |

## Classroom scope

This implementation is **email-based two-step login**. It is easy to trace, but it is not phishing-resistant MFA and does not guarantee an independent possession factor: email access may itself depend on a password. Lesson 4.16 compares it with authenticator apps and passkeys. See [OWASP's explanation of email as an authentication step](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#email).

Password recovery, changing an account's email, authenticator enrollment, and recovery-code management are not implemented in this checkpoint. Do not bypass email verification by setting `emailVerifiedAt` manually in your project. Account recovery and stronger factors require their own design and verification.

Modules 7–8 retain a separate **loopback-only memory demo** for the planner. Its seeded fictional account is already verified; after entering its public practice password, read the simulated OTP in that demo's terminal. It sends no email and ignores `.env`. Use the normal MongoDB server to practice the Gmail workflow described above.
