# Practice one React lesson at a time

Use these complete files with lessons 2.6–2.23. Each numbered folder is a separate example, not a set of files to paste together. The full Campus Events project remains in `../react-events`.

## First setup

Use Node.js 24.x. From `module-02/lesson-examples`, copy `practice-template` to a **new separate folder outside this repository**, such as `react-lesson-practice` in your own development directory. Keep the original template unchanged. The template includes the same pinned React, React Router 7, and Vite dependencies as the companion.

Open a terminal inside your new practice folder:

```powershell
npm ci --include=dev
npm run dev
```

Open the localhost URL printed by Vite. The default example shows a React Workshop with 12 available seats. Do not open `index.html` through a file URL. Stop the server with Ctrl+C.

## Select a lesson

Preserve any changes you want to keep before replacing a practice file. Copy the contents of the numbered example folder into your practice app’s `src` folder. Replace `App.jsx`; for 2.9 also copy `App.css`, and for 2.23 also copy `components`, `data`, and `pages`. Keep `src/main.jsx` from the template.

For example, after copying the files from `2.18`, run the practice app and enter text to observe the controlled form and live preview. Run `npm run build` from the practice folder to check imports and JSX. A successful build does not replace testing the interaction.

Lessons 2.20–2.22 include their own `BrowserRouter`. The template’s `main.jsx` deliberately does not add another router. Open the root URL when switching examples; an old detail URL may not exist in the next example.

The short fragments earlier in each Canvas lesson explain syntax and may require surrounding variables, imports, or components. Only the complete examples in these numbered folders are intended as replacements for practice files. Images mentioned in fragments are placeholders unless an asset is supplied.

## Connect the lesson to your project

Predict the result, run the complete example, try its failure or boundary case, then explain the state/data path. Study the corresponding files in `react-events` to see how the concept fits into a larger app. Implement one understood change in your own project and keep the existing application contracts intact.
