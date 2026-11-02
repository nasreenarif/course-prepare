import { validSuccess, safeFailure } from './contracts.js';
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', fields = {}, requestId = '' } = {}) {
    super(message);
    Object.assign(this, { status, code, fields, requestId });
  }
}
let csrfToken;
let initialization;
export async function api(path, { method = 'GET', body, signal, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(`/api${path}`, {
      method, credentials: 'same-origin', signal: controller.signal,
      headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {})
    });
    if (response.status === 204) {
      if (method === 'DELETE' || (path === '/auth/logout' && method === 'POST')) return null;
      throw new ApiError('The response was empty where data was expected.', { status: 204, code: 'RESPONSE_FORMAT' });
    }
    const requestId = response.headers.get('X-Request-Id') || '';
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      throw new ApiError('The server returned an unexpected response. Check the service address.', { status: response.status, code: 'RESPONSE_FORMAT', requestId });
    }
    let data;
    try { data = await response.json(); }
    catch (error) {
      if (controller.signal.aborted) throw error;
      throw new ApiError('The server response could not be read.', { status: response.status, code: 'RESPONSE_FORMAT', requestId });
    }
    if (!response.ok) {
      const failure = safeFailure(data);
      if (!failure) throw new ApiError('The error response had an unexpected structure.', { status: response.status, code: 'RESPONSE_FORMAT', requestId });
      throw new ApiError(failure.message, { status: response.status, code: failure.code, fields: failure.fields, requestId });
    }
    if (!validSuccess(path, method, data)) throw new ApiError('The response data did not match the expected format.', { status: response.status, code: 'RESPONSE_FORMAT', requestId });
    if (data?.csrfToken) csrfToken = data.csrfToken;
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError('The request took too long. Refresh the list before retrying a save.', { code: 'TIMEOUT' });
    if (controller.signal.aborted) throw new ApiError('Request cancelled.', { code: 'CANCELLED' });
    throw new ApiError('Connection lost. Refresh the list before retrying a save.', { code: 'NETWORK_ERROR' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
export function initializeSession() {
  // Concurrent startup calls share this one token initialization request.
  if (!initialization) initialization = api('/auth/csrf').finally(() => { initialization = undefined; });
  return initialization;
}
