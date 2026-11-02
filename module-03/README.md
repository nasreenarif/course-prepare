# Module 3 — Node, Express, and MongoDB CRUD

`task-api` is a standalone backend. Study how an HTTP request becomes validated data, a Mongoose operation, and a predictable JSON response. It has no React UI or account authentication.

## Setup

Use Node.js **24.x**. From the repository root:

```powershell
cd module-03/task-api
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Copy the environment template only on first setup; keep an already configured `.env`. Set `MONGODB_URI` in `.env` for your local server or Atlas database. See [database setup](../docs/DATABASE_SETUP.md). A VS Code database connection alone does not configure this app.

```powershell
npm start
```

The API should start listening on port 3000 after connecting to MongoDB. `npm run dev` enables Node's file watcher. A startup failure means configuration or database access must be resolved before continuing. Keep credentials out of terminal output and source code.

## First request flow

In a second PowerShell terminal:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
$created = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/tasks -ContentType 'application/json' -Body '{"title":"Review Module 3","description":"Trace the request flow","priority":"high"}'
Invoke-RestMethod http://localhost:3000/api/tasks
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/api/tasks/$($created.id)" -ContentType 'application/json' -Body '{"completed":true}'
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/api/tasks/$($created.id)"
```

Creation returns a task with `id`; the list returns `{ items, page, limit }`; patch returns the updated task. Delete removes the practice task. Try a blank title, an unknown field, a malformed identifier, and a valid identifier that does not exist. Check both the HTTP status and the response body; errors return `{ message }`. The request-body examples in `task-api/requests` are ready to use in an API client.

## Code map

| Location inside `task-api` | Responsibility |
| --- | --- |
| `server.js`, `config` | Read configuration, connect to MongoDB, then start listening. |
| `app.js`, `routes` | Apply middleware and map HTTP method/path to a handler. |
| `controllers` | Coordinate each CRUD operation and response. |
| `models` | Define document fields, Mongoose validation, and indexes. |
| `validation`, `utils` | Validate incoming values and shape public output. |
| `middleware` | Consistent missing-route/error responses. |
| `examples`, `test`, `requests` | Supporting demonstrations, executable checks, and sample request bodies. |

Run `npm test` from `task-api` for the supplied tests. They do not require a live database. Then test actual persistence: create a task, restart the API, and confirm it still exists before deleting it. Automated helper tests alone do not prove database connectivity.

## Continue to Module 4

Module 4 adds a client, sessions, CSRF, and task ownership. It also changes task fields, title limits, response envelopes, and Mongoose major version. Keep this complete Module 3 example alongside Module 4; do not replace it with the later source. Read [the contract comparison](../docs/COURSE_PROGRESSION.md) and preserve your own project's chosen contract when adapting it. This unauthenticated API is a local learning checkpoint, not a protected public service.
