import nodemailer from 'nodemailer';

export function emailSettings(env = process.env) {
  const user = (env.GMAIL_USER || '').trim();
  const pass = (env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user) || user.startsWith('your-') || !/^[a-zA-Z0-9]{16}$/.test(pass)) {
    throw new Error('Set GMAIL_USER and a 16-character GMAIL_APP_PASSWORD in the server environment. See AUTH_SETUP.md.');
  }
  let url;
  try { url = new URL(env.APP_ORIGIN); } catch { throw new Error('Set APP_ORIGIN to the browser address, such as http://localhost:5173.'); }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local && env.NODE_ENV !== 'production')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_ORIGIN must be an HTTPS origin, or a local HTTP origin during development.');
  }
  return { user, pass, appOrigin: url.origin };
}

export function makeMailer(settings, createTransport = nodemailer.createTransport) {
  const transport = createTransport({ service: 'gmail',
    auth: { user: settings.user, pass: settings.pass },
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
    disableFileAccess: true, disableUrlAccess: true
  });
  return {
    async sendMail({ to, subject, text }) {
      // No debug logging: credentials, verification links, and OTPs stay private.
      const result = await transport.sendMail({ from: settings.user, to, subject, text });
      if (!result.accepted?.length || result.rejected?.length) throw new Error('Email was not accepted.');
    }
  };
}
