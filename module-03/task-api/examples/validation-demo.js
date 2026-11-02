import { validateTaskInput } from "../validation/taskInput.js";

const cases = [
  { label: "Valid creation", body: { title: "  Read Module 3  " } },
  { label: "Invalid type", body: { title: 42 } },
  { label: "Unknown field", body: { title: "Read", admin: true } },
  { label: "Valid false patch", body: { completed: false }, partial: true },
  { label: "Empty patch", body: {}, partial: true }
];

for (const example of cases) {
  const result = validateTaskInput(example.body, { partial: example.partial ?? false });
  console.log(example.label, JSON.stringify(result));
}
