CS418 MODULE 3 - TASK API COMPANION

This is a local-development teaching application using Mongoose. It is not
the course milestone specification. Its task fields and routes are examples
to adapt after you understand their behavior. Authentication, authorization,
sessions, cookies, and browser integration are developed in Module 4.

REQUIREMENTS

- Node.js 24 and npm.
- A running local MongoDB Community service OR an authorized Atlas deployment.
- A terminal opened in this task-api folder (beside package.json).

The lockfile supplied with this package resolves Express 5.3.0,
Mongoose 9.11.4, and dotenv 17.4.2. The package.json ranges permit later
compatible versions; use npm ci to reproduce the supplied lockfile.

START THE COMPLETE API

1. Run node --version and verify the course's Node 24 environment.
2. Run npm ci. If deliberately changing dependencies, use npm install and
   keep the resulting manifest and lockfile together.
3. Copy .env.example to a new file named exactly .env in this folder.
4. Supply your actual private MONGODB_URI. The template's local URI assumes
   a MongoDB service at 127.0.0.1:27017. A URI is not a database installer.
5. Start the database service or confirm your Atlas user and network access.
6. Run npm start, or npm run dev for watched JavaScript development.
7. Expect "Database connected." and the API listening address.
8. In a second terminal or API client, request:
   curl -i http://localhost:3000/api/health
9. Complete the live CRUD sequence in Lesson 3.14. Health alone does not
   prove that database writes and reads work.

Stop a development server with Ctrl+C. Restart after changing .env settings.
Keep private .env values out of Git, screenshots, and public messages.
Never put MONGODB_URI in browser-delivered frontend code.

DATABASE-FREE LEARNING EXERCISES

Run these from this folder, one at a time:

node examples/async-demo.js
  Expected ordering: 1, 2, 3, 4; the resolved value is ready.

node examples/config-demo.js
  Expected port and a boolean indicating whether the database setting exists.
  Does not connect to the database or display the URI.

node examples/minimal-server.js
  Runs a separate HTTP-only teaching server on port 3000.
  Stop it before starting the complete API on the same port.

node examples/health-client.js
  Run in a second terminal while a health endpoint is listening on port 3000.
  This is a Node client and does not test browser CORS behavior.

node examples/model-demo.js
  Expected: Read Module 3 false normal. Validates without saving.

node examples/validation-demo.js
  Shows accepted and rejected input cases without HTTP or MongoDB.

node examples/relationship-demo.js
  Demonstrates a separate embedded-checklist model without saving it.
  This does not add a checklist field to the core Task API.

STANDALONE DATABASE EXERCISE

node examples/crud-demo.js
  Requires the configured development database. Creates, reads, updates,
  and deletes its own disposable practice task, then disconnects.
  It is independent of the HTTP listener. It does not delete all tasks.

HTTP EXERCISES

Use the JSON files in requests. The malformed.json file is intentionally
invalid JSON for a parser-error exercise; do not "repair" it accidentally.
On Windows PowerShell, use curl.exe if curl is an alias for another command.
Keep @file arguments quoted to avoid shell interpretation problems.

Create:
curl -i -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" --data-binary "@requests/create-task.json"

List:
curl -i "http://localhost:3000/api/tasks?page=1&limit=10"

Detail (substitute the actual returned id for YOUR_TASK_ID):
curl -i http://localhost:3000/api/tasks/YOUR_TASK_ID

Patch:
curl -i -X PATCH http://localhost:3000/api/tasks/YOUR_TASK_ID -H "Content-Type: application/json" --data-binary "@requests/update-task.json"

Delete only the disposable task created for the exercise:
curl -i -X DELETE http://localhost:3000/api/tasks/YOUR_TASK_ID

EXPECTED CONTRACT

POST /api/tasks        201, one public task, Location header
GET /api/tasks         200, {items, page, limit}
GET /api/tasks/:id     200, one public task
PATCH /api/tasks/:id   200, one updated public task
DELETE /api/tasks/:id  204, no response body

Unknown routes and absent tasks: 404.
Malformed IDs, JSON, or invalid input: 400 where the matching check applies.
Unsupported content type on body routes: 415.
Oversized parsed JSON body: 413.
Unexpected operation failure: safe 500 message.
The order of checks matters when one request has several defects.

AUTOMATED TESTS AND LIMITS

Run npm test. The supplied tests check real validation helpers, real Mongoose
document validation without persistence, and HTTP behavior with controlled
model stubs. Those stubs belong only in the test process.

Passing these tests does not prove MongoDB connectivity or persistence.
Complete the manual database-backed cycle, including a restart and read,
before relying on your local setup. Test the changes you make in your own
milestone project and use Canvas to confirm its assignment requirements.

FILE RESPONSIBILITIES

server.js                 configuration, initial DB connection, listening
app.js                    Express middleware and route mounting
config/database.js        shared connection setup
models/Task.js            core stored task fields and rules
routes/taskRoutes.js      method/path declarations
controllers/taskController.js  operation coordination
validation/taskInput.js    strict allowed body and query inputs
middleware/http.js        content type, ID format, not-found and error handling
utils/taskResponse.js     selected public fields and date/ID representation
test/module3.test.js      isolated and stubbed HTTP checks

Use the lessons for explanations of every file. Optional extension snippets
in Lesson 3.15 require additional model/validation/contract changes before
they become supported operations; they are not part of this core API.
