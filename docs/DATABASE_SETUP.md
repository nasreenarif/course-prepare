# Database setup for these examples

## Choose what runs locally

Your Node/React app can run on your computer while its database runs in Atlas. For an entirely local stack, you need a running local MongoDB server. The VS Code MongoDB extension is a database client; its saved connection does not populate the application's environment.

| Example | Local configuration file | Example database name |
| --- | --- | --- |
| Module 3 | `module-03/task-api/.env` | `module3_tasks` |
| Module 4 | `module-04/task-app/server/.env` | `cs418_module4` |
| Module 5 | `module-05/task-app/server/.env` | `cs418_module5` |
| Module 6 | `module-06/task-app/server/.env` | `cs418_module6` |
| Module 7 | `module-07/task-app/server/.env` | `cs418_module7` |
| Module 8 | `module-08/task-app/server/.env` | `cs418_module8` |

Module 2 needs no database. Module 7/8 memory demos ignore `.env` and need none either. Use fictional data throughout.

## Local MongoDB

If MongoDB is already installed and its server is running on the standard local port, keep the module's example `MONGODB_URI`. For Module 3 it is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/module3_tasks
```

That URI expects a local service; it will not connect to your Atlas account. If you have not installed a server, follow MongoDB's [Community installation guide](https://www.mongodb.com/docs/manual/installation/) for your operating system or use Atlas below. These examples do not install or start a database service.

## Atlas

Use your cluster's **Connect → Drivers** connection string. Ensure your current IP is permitted in the cluster's network access list and use a **database user**, which is distinct from your Atlas website login. See MongoDB's [application connection guide](https://www.mongodb.com/docs/atlas/driver-connection/).

Copy `.env.example` to `.env` in the directory listed above. Replace only its `MONGODB_URI` with your actual driver URI, including the chosen practice database name. This placeholder illustrates its shape, not a working credential:

```dotenv
MONGODB_URI="mongodb+srv://YOUR_DB_USER:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/module3_tasks?retryWrites=true&w=majority"
```

Use the host and options supplied for your cluster. Percent-encode special characters in the username/password as required by the URI format; do not percent-encode the entire URI. Do not paste this URI into React, commit it, or share it in screenshots. Configure your own database access using the course requirements.

## Session configuration for Modules 4–8

Generate a secret locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Place the generated value in `SESSION_SECRET` in that module's `server/.env`. Keep `NODE_ENV=development` for local practice. Keep the other local defaults unless you are following a specific lab.

## Start the correct script

| Module | Working directory | Command | How `.env` is loaded |
| --- | --- | --- | --- |
| 3 | `module-03/task-api` | `npm start` | `dotenv/config` in the server |
| 4 | `module-04/task-app/server` | `npm start` | Node's `--env-file=.env` flag |
| 5–8 | That module's `task-app/server` | `npm run dev` | Node's `--env-file=.env` flag |

For Modules 5–8, `npm start` expects the hosting environment to supply variables; it does not load your local `.env`. Restart the server after editing settings. A pre-existing shell environment variable can override the file, so check for stale settings privately if the app appears to use an old database.

## If startup fails

Check the working directory, Node version, `.env` filename (not `.env.txt`), and required settings first. For local MongoDB, check the service is running on the URI's port. For Atlas, check cluster availability, database-user permissions/credentials, network access, and DNS/network connectivity. A successful VS Code connection is useful evidence, but the app must use the same valid settings itself.

Do not print the connection string while debugging. Once startup succeeds, open `/api/health` on port 3000 and then complete the module's create/read/update/reload/delete exercise. A health response alone does not prove persistence, permissions, or every database operation works.
