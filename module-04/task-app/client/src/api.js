let csrfToken;
export async function api(path, { method = 'GET', body, timeoutMs = 15000 } = {}) {
  const response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin', signal: AbortSignal.timeout(timeoutMs),
    headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {})
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw Object.assign(new Error(data?.error || 'Request failed.'), { status: response.status });
  if (data?.csrfToken) csrfToken = data.csrfToken;
  return data;
}
export async function initializeSession() { await api('/auth/csrf'); }
