# Module 1 — Git workflow and full-stack foundations

Use this module with Canvas lessons 1.1–1.10. There is no Node application or database to start here. Practice in your assigned course repository, keeping this reference repository separate from your own project.

## Trace the workflow

From your own repository directory, inspect the current state:

```powershell
git status
git branch --show-current
git log --oneline -5
```

`status` distinguishes unstaged, staged, and untracked work. The branch command identifies the current branch. The log lists committed checkpoints; it does not show unsaved or uncommitted work.

Make a small meaningful README change. Inspect and commit only that intended file:

```powershell
git diff -- README.md
git add README.md
git diff --staged
git commit -m "Describe the project purpose and first workflow"
git status
```

Use the clone URL and sharing instructions supplied through Canvas. Follow the branch and push instructions for your assigned repository. A local commit is not uploaded until the appropriate push succeeds; confirm the expected commit in GitHub. Never commit a real `.env`, password, database URI, API key, or session secret.

## Explain one request before coding it

For a user creating a record, identify the browser action, HTTP method/path, request body, server validation and permission checks, database write, response status/body, and visible result. The illustrative endpoints in Module 1 explain architecture; they are not a running service. Module 3 supplies an actual Task API.

## Ready to continue

You should be able to inspect a diff, make and locate a meaningful commit, explain how to preserve work during a conflict, and distinguish frontend state from durable database storage. Continue with [Module 2](../module-02/README.md) and the [course progression guide](../docs/COURSE_PROGRESSION.md).
