import { AppError } from './errors.js';
export function captchaSettings(env = process.env) {
  if (!['true','false',undefined].includes(env.CAPTCHA_ENABLED)) throw new Error('CAPTCHA_ENABLED must be true or false.');
  const enabled = env.CAPTCHA_ENABLED === 'true';
  if (env.NODE_ENV === 'production' && !enabled) throw new Error('Enable CAPTCHA for this teaching app before production.');
  const siteKey = env.RECAPTCHA_SITE_KEY || '';
  const secret = env.RECAPTCHA_SECRET_KEY || '';
  const hostnames = (env.RECAPTCHA_HOSTNAMES || '').split(',').map(x => x.trim()).filter(Boolean);
  if (enabled && (!siteKey || !secret || !hostnames.length)) throw new Error('Configure CAPTCHA keys and exact allowed hostnames.');
  return { enabled, siteKey, secret, hostnames };
}
export function makeCaptchaVerifier({ secret, hostnames, fetchImpl = fetch }) {
  return async token => {
    if (typeof token !== 'string' || !token || token.length > 4096) {
      throw new AppError(400, 'Complete the verification challenge.', { code: 'CAPTCHA_REQUIRED' });
    }
    let data;
    try {
      const response = await fetchImpl('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST', signal: AbortSignal.timeout(5000),
        body: new URLSearchParams({ secret, response: token })
      });
      if (!response.ok) throw new Error('provider HTTP error');
      data = await response.json();
      if (!data || typeof data.success !== 'boolean') throw new Error('provider format error');
    } catch {
      throw new AppError(503, 'Verification is unavailable. Try again later.', { code: 'CAPTCHA_UNAVAILABLE' });
    }
    if (!data.success || !hostnames.includes(data.hostname)) {
      throw new AppError(400, 'Verification expired or failed. Complete a new challenge.', { code: 'CAPTCHA_REJECTED' });
    }
  };
}
