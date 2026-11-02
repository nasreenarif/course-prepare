# Module 2 — React foundations

Use the **Campus Events** application to practice the React concepts from Module 2 in one runnable project. Work through components, props, state, forms, lists, and routing before adding a backend in later modules. You do not need MongoDB, `.env`, or an account to run this example.

## Run it

From the repository root, using Node.js 24.x:

```powershell
cd module-02/react-events
npm ci --include=dev
npm run dev
```

Open the localhost URL printed by Vite (normally `http://localhost:5173`). Keep the terminal running; Ctrl+C stops it. Run `npm run check` from the same folder to execute six helper tests and build the client. `npm run preview` serves a completed build locally; run `npm run build` first.

## What to try

1. Browse three sample events. Search `library`, then combine it with the Technology category. Expect one result. An unmatched query displays the empty state; Clear filters restores the list.
2. Save an event. Choose Saved only, open that event's detail page, and unsave it. Return to Browse: the shared saved state reflects the change.
3. Open Create an event and submit blank fields. Read the error summary and each field message. Try a capacity of 0 or 1.5; both are rejected.
4. Enter a title of 3–80 characters, one of the categories, a valid date, a location of 2–100 characters, and an integer capacity of 1–500. Submission opens the new event's detail route. Return to Browse to see it in the list.
5. Refresh on that new detail route: the event disappears because the in-memory array resets. Existing sample routes still work. Try `/events/missing` and `/missing` to see the two different not-found cases.
6. Use Tab/Shift+Tab and Enter to operate the controls. Resize the window to see the cards and form reflow.

## Read the code in this order

| File inside `react-events` | Concept and why it matters |
| --- | --- |
| `src/data/events.js` | Arrays of objects and stable string IDs separate data from presentation. |
| `src/components/EventCard.jsx` | A reusable component receives an event and a callback as props. `children` lets a parent supply extra content. |
| `src/pages/EventsPage.jsx` | Controlled search/category inputs, conditional empty output, `.filter`, `.map`, and stable `key` values. |
| `src/App.jsx` | Shared event state lives above the pages; functional state updates use the latest array and preserve prior values. |
| `src/pages/NewEventPage.jsx` | Controlled fields, object spread, `preventDefault`, field validation, creating a stable ID, and navigation after success. |
| `src/lib/events.js` | Pure filtering, immutable updates, normalized form values, and calendar-date checks; these functions can be tested without rendering. |
| `src/main.jsx` and `src/components/Layout.jsx` | React root, `StrictMode`, `BrowserRouter`, shared navigation, and `Outlet` for nested routes. |
| `src/pages/EventDetailPage.jsx` | `useParams`, finding an object by ID, and a useful fallback when the record is absent. |
| `src/styles.css` | Imported CSS, flexible layout, focus indicators, and responsive cards. |

## Understand the data flow

`App` owns the event array because both the list and detail page need it. It passes values down as props and callbacks down for user actions. A card calls `onToggleSaved(id)`; App updates its state, then React renders the affected views. The filter inputs are local to the browse page, so leaving that page resets its filters while App's event data survives route changes.

The visible list is derived from the original array plus filter inputs. Storing that filtered list in another state variable would create two values that could disagree. `toggleSaved` uses `.map` and object spread to return new data instead of mutating existing props or state. The create handler uses `[...previous, event]` to append safely.

Form inputs supply strings, including the number field. Validation converts capacity to a number, trims text, checks category membership and a real calendar date, and returns field-specific errors. The form uses `noValidate` so you can trace this explicit validation path; HTML input types still provide useful controls. Later modules must repeat validation on the server because client checks can be bypassed.

The example uses React Router 7 through `react-router-dom`, matching the course's import style. `Link`/`NavLink` preserve the running document; `useNavigate` changes location after creating an event. `BrowserRouter` requires an index-page fallback for deep links on a deployed static host. Vite handles local development; opening `index.html` directly as a file will not run the source app. See the [React Router 7 documentation](https://reactrouter.com/7.18.5/home).

## Adapt it to your project

Replace events with your own resource while keeping stable IDs, clear props, and explicit validation. Add one field end to end: sample data → form state → validation → card/detail display → test. Explain where each state value belongs before adding it.

“Save” marks a favorite for this browser visit. Capacity is descriptive, not a live seat count. There is no API, database, authentication, payment, reservation, or persistent storage. Module 3 teaches durable CRUD; Module 4 demonstrates a React client connecting to an authenticated API. Read [the course progression guide](../docs/COURSE_PROGRESSION.md) before changing domains or contracts.

## Focused lesson examples

Use [lesson-examples/README.md](lesson-examples/README.md) for the exact complete examples from lessons 2.6–2.23 and a separate practice template. Keep these exercises separate from the full Campus Events app. [Lesson map](../docs/LESSON_MAP.md) connects every Canvas lesson with its source and practice task.
