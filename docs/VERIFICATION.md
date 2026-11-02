# Testing your examples

Run the checks for your current module before adapting its code and again after your changes. A passing test suite helps you catch regressions, but you also need to exercise the app in your own browser and database environment.

## Reference results

The following results provide a baseline for the examples on Windows with Node.js **24.22.2** (2026-10-31). Use Node.js 24.x for this course and compare your output with the module README. Your test count may change as you add tests to your own project.

| Module | Checks | Expected passing Node tests |
| --- | --- | --- |
| 2 | Helper tests and Vite build | 6 |
| 3 | API/helper tests | 12 |
| 4 | Server tests, practice tests, continuity exercises, and client build | 25 (13 + 1 + 11) |
| 5 | `npm run check`: server/client/practice tests and client build | 22 |
| 6 | `npm run check`: server/client/practice tests and both client entries built | 31 |
| 7 | `npm run check`, plus 13 Gemini provider fixtures and five mock-evaluation cases | 53 |
| 8 | `npm run check`, including configured lint, four intentional lint examples, quality tests, and both client entries built; 13 Gemini provider fixtures and five mock-evaluation cases | 63 |

The reference runs total **212 passing Node tests across the module folders**. Later examples repeat earlier tests to check that established behavior still works. The provider-fixture, mock-evaluation, and lint demonstrations are additional checks and are not included in that total. You do not need to treat repeated tests as separate assignment requirements.

## Check Module 2 in your browser

Use the exercises in the Module 2 README to check filtering, an empty result, saved state across routes, form errors, event creation, and navigation. Refresh after creating an event to confirm the documented in-memory behavior. Try both an unknown event ID and an unknown page.

Navigate with the keyboard, use the skip link, and inspect the page at desktop and mobile widths. Check the browser console for errors. These flows were exercised in 11 reference browser checks at 1280 px and 375 px; repeat them after your changes. They do not constitute a complete accessibility audit.

## Verify the integrations you use

Modules 7 and 8 use Gemini for live planning. Their tests cover request configuration, structured responses, safety blocks, incomplete/malformed output, quota/configuration failures, and the signed-in draft/save flow. Twelve browser checks across the two modules exercise the Gemini label, draft review, explicit saving, manual fallback, safety rejection, and cancellation using injected provider responses. These reference checks make no live Gemini request. Use your module's `GEMINI_SETUP.md` for the optional live smoke command and your own integration checks.

Server tests use controlled database/provider doubles where configured. A mock demo does not establish that your MongoDB connection, live CAPTCHA, or live AI provider works. Test your own configured integrations separately and record the result.

For database-backed modules, create a record, restart the server, and confirm that the record persists. For protected routes, use two separate accounts and check that one cannot access the other's data. Test the applicable error paths, session behavior, and keyboard interactions. Use each module's README and checklists for the complete flow.

Email delivery, a real second factor, public hosting, and a complete accessibility/security review require their own implementation and evidence. Mark a check as **not tested** when you have not run it, and explain what is needed to complete it. A passing local build alone does not establish production readiness.

## Record your results

For each meaningful check, record your project revision, environment, steps, expected result, actual result, and any correction or follow-up. Use the evidence templates included with the module. Keep your actual credentials, session cookies, and private user data out of screenshots and reports.

## Focused lecture examples

The 18 complete React examples for lessons 2.6–2.23 have also been built and rendered with the supplied practice template. Additional browser checks exercise queued state updates, controlled text/checkbox values and reset, dynamic navigation, missing records, and missing routes. Run the relevant interaction again after changing an example. These checks do not establish a complete accessibility audit.

The Module 4 `identity-demo.mjs` runs the local verification-token and pending-factor state transitions. It asserts rejection, one-time consumption, and the separation between pending and authenticated identity. It remains a fixture exercise, not proof of real mail delivery or a real second factor.

## Email authentication checks

Modules 4–8 now include `server/auth.test.js`. These tests use captured email and controlled data to verify registration links, pending login, OTP expiry/attempt limits/replay, and protected routes. They do not send Gmail messages. Complete the real Gmail/MongoDB checklist in [authentication setup](AUTHENTICATION.md) separately. Old password-only sessions must sign in again; existing accounts must verify their address.
