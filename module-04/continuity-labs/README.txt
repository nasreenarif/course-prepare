COURSE CONTINUITY LABS -- no network, email, database or real second factor
Use Node.js 24.x, the common runtime for this course.
From this folder:
  node --test contract-bridge.test.mjs identity-state.test.mjs
Expected: 11 passing tests. No packages need installation.

Use contract-bridge to compare the Module 3 and Module 4+ API contracts.
It does not migrate data or automatically discard description/priority fields.
identity-state demonstrates email-token and pending-MFA lifecycle decisions only.
The factor verifier in tests is a fixture, NOT TOTP/WebAuthn or proof of possession.
The token store is in-memory and cannot coordinate processes or transactions.
Production integration requires real delivery, persistent atomic consumption, rate
limits, trusted account lookup, factor verification/replay protection, session
rotation, enrollment/recovery and UI. See lessons 4.15 and 4.16.
These exercises run separately from the Task App. Integrate and verify email
verification or MFA in your project when required by your assignment.
