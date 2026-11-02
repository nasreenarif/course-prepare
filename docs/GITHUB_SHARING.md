# Using GitHub for your coursework

Use this repository to study the module examples, and keep your own application in a separate project repository. Your project should show how you apply the concepts, make design decisions, and verify your work. Follow the repository visibility and submission requirements in Canvas.

## Get the course examples

I maintain the examples in [nasreenarif/course-prepare](https://github.com/nasreenarif/course-prepare). Each Canvas lesson links directly to its module folder: `module-01` through `module-08`. The README displayed in that folder provides the setup and practice instructions for that module.

1. Install Git, then open a terminal in the directory where you keep your coursework.
2. Clone the full repository once:

   ```powershell
   git clone https://github.com/nasreenarif/course-prepare.git
   cd course-prepare
   ```

3. Open `course-prepare` in VS Code using **File → Open Folder**.
4. Read the README for your current module, such as `module-04/README.md`. Run its commands in the working directory it specifies. There is no top-level `npm install` or `npm start`.

Keep all module folders and `docs/` together so documentation links and shared learning references work. The repository root contains `README.md`, `.gitignore`, `.nvmrc`, `docs/`, and `module-01/` through `module-08/`; do not create another Git repository inside each module. Module 1 contains Git and architecture practice; runnable application examples begin with Module 2.

If you use GitHub Desktop, choose **File → Clone repository → URL**, enter `https://github.com/nasreenarif/course-prepare`, and select your local coursework directory.

If Git is unavailable, open the repository root on GitHub, choose **Code → Download ZIP**, and extract it before opening files. GitHub normally names that extracted folder `course-prepare-main`. It contains the same module directories, but it has no Git history and cannot receive updates with `git pull`; download a fresh copy to get later changes. The course does not require separate companion ZIP downloads for each module.

## Receive course updates

Keep the cloned course examples as a reference copy. From the root of that clone, check for local edits before updating:

```powershell
git status --short
git pull --ff-only
```

Run the pull command only after you have saved your experiments elsewhere and the reference copy is clean. `--ff-only` permits an update that moves your branch forward without creating a merge commit. If Git reports local changes or diverged history, stop and ask for help; do not discard your work to force an update. After pulling, read any changed module instructions and rerun `npm ci` in affected package directories if their lockfiles changed. Your private `.env` settings remain local.

Develop your assessed application in your own project repository. Use the course module examples to understand and adapt a feature, then commit the tested change in your own project. Course updates do not automatically become changes in your project.

## Maintain your project repository

Develop your project incrementally. After you implement and test a feature, make a focused commit with a message that explains the change. Continue improving the same application through the modules instead of replacing it with each reference example.

Include your source, tests, README, `package.json`, `package-lock.json`, `.gitignore`, and safe `.env.example` templates. Your README should explain what the app does, how to run it, which features work, how you tested them, and any remaining limitations.

Keep `.env`, passwords, API keys, session secrets, real user data, `node_modules`, generated `dist` files, and logs out of your commits. The course `.gitignore` provides a starting point; check the rules again if you change your project's folder structure. Git ignore rules do not filter files you manually select for a browser upload.

## Review before committing

From your project repository, inspect the selected files and changes:

```powershell
git status --short --untracked-files=all
git diff
git diff --cached
```

Run `git check-ignore -v` with the path to a local `.env` file to confirm that Git ignores it. Keep `.env.example` available to commit with placeholders only. An ignore rule does not remove a secret from an existing commit. See [GitHub's ignore-file documentation](https://docs.github.com/en/get-started/git-basics/ignoring-files).

## Submit your work

Use the repository link and submission format requested in Canvas. Confirm that I can access your repository and any required recording or hosted application. Keep the submitted revision identifiable with a commit hash or the release/tag specified by the assignment. Explain your implementation and report your own test results, including any checks you could not complete.
