const allowedFields = ["title", "description", "completed", "priority"];

export function validateTaskInput(body, { partial = false } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Body must be a JSON object." };
  }
  const keys = Object.keys(body);
  if (keys.some(key => !allowedFields.includes(key))) {
    return { error: "Body contains an unsupported field." };
  }
  if (partial && keys.length === 0) {
    return { error: "Provide at least one field to update." };
  }
  const value = {};
  if (!partial || Object.hasOwn(body, "title")) {
    if (typeof body.title !== "string" ||
        body.title.trim().length < 3 || body.title.trim().length > 100) {
      return { error: "Title must contain 3 to 100 characters." };
    }
    value.title = body.title.trim();
  }
  if (Object.hasOwn(body, "description")) {
    if (typeof body.description !== "string" || body.description.trim().length > 1000) {
      return { error: "Description must be a string of at most 1000 characters." };
    }
    value.description = body.description.trim();
  }
  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      return { error: "completed must be a boolean." };
    }
    value.completed = body.completed;
  }
  if (Object.hasOwn(body, "priority")) {
    if (!["low", "normal", "high"].includes(body.priority)) {
      return { error: "priority must be low, normal, or high." };
    }
    value.priority = body.priority;
  }
  return { value };
}

export function validateListQuery(query) {
  if (Object.keys(query).some(key => !["completed", "page", "limit"].includes(key))) {
    return { error: "Unsupported query parameter." };
  }
  const filter = {};
  if (query.completed !== undefined) {
    if (query.completed !== "true" && query.completed !== "false") {
      return { error: "completed query must be true or false." };
    }
    filter.completed = query.completed === "true";
  }
  const numbers = {};
  for (const [name, fallback, maximum] of [["page", "1", 10000], ["limit", "10", 50]]) {
    const raw = query[name] ?? fallback;
    if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw) || Number(raw) > maximum) {
      return { error: `${name} must be an integer from 1 to ${maximum}.` };
    }
    numbers[name] = Number(raw);
  }
  return { value: { filter, ...numbers } };
}
