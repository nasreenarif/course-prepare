const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const task = value => object(value) && typeof value.id === 'string'
  && typeof value.title === 'string' && typeof value.completed === 'boolean';
const user = value => object(value) && typeof value.id === 'string' && typeof value.email === 'string';

export function validSuccess(path, method, data) {
  if (!object(data)) return false;
  if (path === '/auth/csrf') return typeof data.csrfToken === 'string' && data.csrfToken.length > 0;
  if (path === '/auth/verify-otp') return user(data.user) && typeof data.csrfToken === 'string' && data.csrfToken.length > 0;
  if (['/auth/login', '/auth/resend-otp'].includes(path)) return data.otpRequired === true && typeof data.csrfToken === 'string'
    && Number.isFinite(data.expiresInSeconds) && Number.isFinite(data.resendAfterSeconds);
  if (path === '/auth/pending') return typeof data.otpRequired === 'boolean' && Number.isFinite(data.expiresInSeconds) && Number.isFinite(data.resendAfterSeconds);
  if (path === '/auth/resend-verification') return typeof data.message === 'string';
  if (['/auth/me', '/auth/register'].includes(path)) return user(data.user);
  if (path === '/tasks' && method === 'GET') return Array.isArray(data.tasks) && data.tasks.every(task);
  if (path === '/tasks' && method === 'POST') return task(data.task);
  if (/^\/tasks\/[^/]+$/.test(path) && ['GET', 'PATCH'].includes(method)) return task(data.task);
  return true; // Additional endpoints need their own explicit contract checks.
}

export function safeFailure(data) {
  if (!object(data)) return null;
  const fields = {};
  if (object(data.fields)) {
    for (const key of ['title', 'completed', 'email', 'password']) {
      if (typeof data.fields[key] === 'string') fields[key] = data.fields[key];
    }
  }
  return {
    message: typeof data.error === 'string' ? data.error : 'Request failed.',
    code: typeof data.code === 'string' ? data.code : 'HTTP_ERROR',
    fields
  };
}
