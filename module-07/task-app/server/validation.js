import { AppError } from './errors.js';

export function taskInput(body, partial = false) {
  const fields = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Send a JSON object.', { code: 'VALIDATION_ERROR' });
  }
  const keys = Object.keys(body);
  if (!keys.length || keys.some(key => !['title', 'completed'].includes(key))) {
    throw new AppError(400, 'Only title and completed are accepted.', { code: 'VALIDATION_ERROR' });
  }
  const input = {};
  if (!partial || Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string') fields.title = 'Enter a text title.';
    else if (!body.title.trim()) fields.title = 'Enter a title.';
    else if (body.title.trim().length > 200) fields.title = 'Use 200 characters or fewer.';
    else input.title = body.title.trim();
  }
  if (Object.hasOwn(body, 'completed')) {
    if (typeof body.completed !== 'boolean') fields.completed = 'Use true or false.';
    else input.completed = body.completed;
  }
  if (Object.keys(fields).length) {
    throw new AppError(400, 'Correct the highlighted fields.', { code: 'VALIDATION_ERROR', fields });
  }
  return input;
}
