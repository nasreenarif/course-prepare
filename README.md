# CS418 course examples — Modules 1–8

Welcome to the CS418 course examples. I have organized these examples to help you practice each module and apply the concepts to your own project. Start with the README for the module you are studying. Each folder runs independently, so you can focus on the current topic while referring back to earlier work.

Use these examples alongside your Canvas lessons. Check Canvas for assignments, grading criteria, and due dates. Module 1 supplies a Git and architecture practice guide; runnable application examples begin with Module 2. Use the [lesson-to-code map](docs/LESSON_MAP.md) to find the files and checks for each Canvas lesson.

## Get the course examples

The course repository is [nasreenarif/course-prepare](https://github.com/nasreenarif/course-prepare). I maintain one folder per module so you can find the code that matches your current Canvas lesson.

From the directory where you keep your coursework, run:

```powershell
git clone https://github.com/nasreenarif/course-prepare.git
cd course-prepare
```

Open this folder in VS Code and choose the module README below. Clone the repository once; you do not need a separate repository for each module. To receive later updates in an unchanged reference copy, run `git pull --ff-only` from `course-prepare`. Keep your experiments and assessed project in a separate repository. See [the GitHub guide](docs/GITHUB_SHARING.md) for the ZIP alternative and update instructions.

## Choose an example

| Module | Example | What is introduced | Database needed? |
| --- | --- | --- | --- |
| [1](module-01/README.md) | Git and architecture practice | Commits, repository workflow, request/response responsibilities | No |
| [2](module-02/README.md) | React campus events | Components, props, state, forms, lists, routing | No |
| [3](module-03/README.md) | Express Task API | HTTP, CRUD, validation, MongoDB/Mongoose | Yes to run the API; no for unit tests |
| [4](module-04/README.md) | React + Task API | Verified email, login OTP, sessions, CSRF, task ownership | Yes for the full app |
| [5](module-05/README.md) | Resilient Task App | Error contracts, loading/cancellation, deployment rehearsal | Yes for the full app |
| [6](module-06/README.md) | Accessible Task App | Accessible forms/dialogs, responsive UI, security headers, CAPTCHA | Yes for full app; no for accessibility lab |
| [7](module-07/README.md) | AI-assisted Task App | Gemini mock/live planning, validation, quotas, human review | No for memory demo; yes for normal app |
| [8](module-08/README.md) | Verified Task App | Test strategy, linting, debugging, release evidence | No for memory demo and automated checks |

```text
course-prepare/
├── README.md
├── .gitignore
├── .nvmrc
├── docs/
│   ├── COURSE_PROGRESSION.md
│   ├── AUTHENTICATION.md
│   ├── DATABASE_SETUP.md
│   ├── GITHUB_SHARING.md
│   └── VERIFICATION.md
├── module-01/  README.md
├── module-02/  README.md + react-events/ + lesson-examples/
├── module-03/  README.md + task-api/
├── module-04/  README.md + task-app/ + continuity-labs/
├── module-05/  README.md + task-app/
├── module-06/  README.md + task-app/
├── module-07/  README.md + task-app/
└── module-08/  README.md + task-app/
```

## Before running code

Use **Node.js 24.x with npm** as the common course runtime. Module 3 requires that major version, and it works across the examples in this repository. `.nvmrc` records the choice for compatible version managers; it does not install Node. Check `node --version` in the terminal you will use.

There is no top-level `npm install` or `npm start`. Open the example named in a module README and run its commands there. Each application has its own `package.json` and lockfile. Keep those lockfiles when sharing; `npm ci` installs their recorded dependencies. PowerShell commands use `Copy-Item`; macOS/Linux users can substitute `cp`. If PowerShell blocks `npm.ps1`, use `npm.cmd` for the same commands.

Run one module at a time: APIs normally use port 3000; Vite normally uses 5173. Stop servers with Ctrl+C before switching. Use `localhost` consistently for the browser to avoid cookie/origin confusion. Modules 4–8 have separate example databases and cookie names; an account created in one example is not automatically present in another.

For the easiest first run, use Module 2. For a full-stack demo without a database or paid API key, use Module 7 or 8's explicitly labeled memory demo. To enable live planning, follow the [Module 7 Gemini setup](module-07/task-app/GEMINI_SETUP.md) or [Module 8 Gemini setup](module-08/task-app/GEMINI_SETUP.md).

## How to learn across modules

Read [Course progression](docs/COURSE_PROGRESSION.md) before combining code. Module 3 and Module 4 differ in task fields, response shapes, validation limits, and dependency versions. Module 4 is not a drop-in replacement for Module 3. Maintain one evolving project of your own and adapt each feature deliberately. Use these module folders as reference examples as you build, test, and explain your implementation.

Modules 4–8 use **Gmail through Nodemailer**: registration sends a verification link, and password login sends a six-digit OTP. Complete [the authentication setup guide](docs/AUTHENTICATION.md) before running a normal Task App. Password recovery and authenticator/passkey enrollment remain separate extensions. Email-based two-step login is distinguished from stronger MFA in lesson 4.16.

## Configure and share safely

Copy the relevant `.env.example` to `.env` locally and fill in your own settings. Connecting the MongoDB VS Code extension does not configure the Node application. [Database setup](docs/DATABASE_SETUP.md) explains the application settings for local MongoDB and Atlas.

The root `.gitignore` covers dependency folders, generated builds, logs, and local `.env` files at every module depth while keeping `.env.example`. Install dependencies and configure your own local environment using the module instructions. Follow [Using GitHub for your coursework](docs/GITHUB_SHARING.md) to keep your project organized and your credentials private.

Use [Testing your examples](docs/VERIFICATION.md) to understand the expected checks and what you still need to verify in your own environment. Each app also includes a `README.txt` and practice notes with additional exercises. Numbered lesson references point to your Canvas course.
