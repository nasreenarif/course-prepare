# How the examples fit together

## A sequence of reference checkpoints

Start with Module 1’s Git workflow, then use Module 2’s Campus Events app to connect React concepts in one working example. The separate lesson examples let you practice one concept at a time. Modules 3–8 provide independent Task API/App checkpoints. Module 4 also includes isolated contract and identity-state exercises. Read each module’s README before running commands or adapting code.

The event domain in Module 2 and task domain in Module 3 teach transferable patterns; they are not the same data model. If your own project is an event planner, keep events as your resource when implementing the API. You do not have to rename your project to Task App.

| Transition | Retained idea | New work to study |
| --- | --- | --- |
| 2 → 3 | Objects, arrays, validation | Move durable records behind an HTTP API and database. React state alone is temporary. |
| 3 → 4 | CRUD and server validation | Add a React client, users, verification links, login OTPs, sessions, CSRF, and owner-scoped queries. Explicitly reconcile the contracts below. |
| 4 → 5 | Authentication and task ownership | Standardize safe errors; add response validation, load states, cancellation, and a same-origin build path. |
| 5 → 6 | Complete request flow | Improve keyboard/focus behavior and responsive layout; add security headers and optional local CAPTCHA integration. |
| 6 → 7 | Protected CRUD and accessible UI | Add an optional AI draft workflow. Treat returned content as untrusted, review it, then save using ordinary validation. |
| 7 → 8 | Working app and mock AI | Build evidence with tests, lint, failure reproduction, debugging, and release checks. |

## Module 3 → 4 contract differences

| Detail | Module 3 Task API | Module 4 Task App |
| --- | --- | --- |
| Task data | `title`, `description`, `completed`, `priority` | `title`, `completed`, plus server-assigned `owner` |
| Title length | 3–100 characters | 1–200 characters |
| List response | `{ items, page, limit }` | `{ tasks }` |
| Single/create/update response | A task object directly | `{ task }` |
| Error response | `{ message }` | `{ error }` |
| Authentication | None | Session cookie and CSRF protection |
| Database dependency | Mongoose 9 | Mongoose 8 |

Module 5 expands errors to `{ error, code, fields, requestId }`. Read the actual request/response tests for edge cases. The later list endpoint caps results at 100; it does not preserve Module 3's pagination. These are different teaching decisions, not a migration plan.

The Module 4 [contract exercises](../module-04/continuity-labs/contract-bridge.mjs) let you inspect both list shapes explicitly. Do not silently discard description or priority when adapting a project. Write down the schema and response format you are keeping, update both client and server, and test your chosen behavior.

## Repeated code and exercises

Keep repeated application files in each checkpoint: they make the module independently runnable. Modules 6–8 retain earlier accessibility/booking exercises, and Module 8 retains the AI labs. They are background practice unless the module README or Canvas assignment specifically asks for them again. Compare the listed changed files before reading inherited code.

Folders called `client` and `server` play the same roles as `frontend` and `backend` in some lesson/project outlines. Keep companion names because scripts, imports, and build settings refer to them. Modules 7–8 additionally require `shared`; copying only client and server would break imports.

## Recommended student workflow

1. Clone or download this instructor repository once and run the relevant checkpoint.
2. Read the new module's concept and trace one feature through its UI, request helper, route, model, and tests.
3. Implement the corresponding feature in your own project.
4. Test it, commit the milestone in your own repository, and record any remaining limitations.

Use separate practice databases per checkpoint. No example migrates data, assigns owners to old Module 3 tasks, or copies accounts between databases. The memory demos in Modules 7–8 discard all data on restart.

Modules 4–8 implement verification links and email-based login OTPs with Gmail/Nodemailer. Follow [authentication setup](AUTHENTICATION.md). `module-04/continuity-labs` remains an optional, isolated model of identity decisions. Authenticator/passkey enrollment and recovery are separate extensions; email-based two-step login does not guarantee independent-factor MFA.

## Short lesson examples and the complete app

The standalone React examples isolate one idea. Their fields (such as `seats`, `isPublic`, or a numeric sample ID) are local to that exercise. The complete Campus Events app uses its own documented event contract: string IDs, title, category, date, location, capacity, and saved state. Its helper tests define the accepted field limits.

Do not merge every sample field into your project. Choose your resource contract, then update sample data, form state, validation, display, routes, and tests together. A concept example and a complete reference checkpoint can teach the same pattern while intentionally using different data.

Use `LESSON_MAP.md` to locate the matching complete source. Runnable lesson examples include imports and a documented entry point. Fragments marked as additions or design examples need their surrounding file and any stated schema changes before they can run.
