import { randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from './passwords.js';
import { AuthError, makeIdentity, OTP_MINUTES, RESEND_SECONDS } from './identity.js';

const publicUser = user => ({ id: String(user._id), email: user.email });
const save = req => new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
const regenerate = req => new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));

function credentials(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') throw new AuthError(400, 'Email and password are required.', 'CREDENTIALS_REQUIRED');
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError(400, 'Enter a valid email address.', 'EMAIL_FORMAT');
  if (body.password.length < 15 || body.password.length > 128) throw new AuthError(400, 'Use a password of 15 to 128 characters.', 'PASSWORD_LENGTH');
  return { email, password: body.password };
}

// Session/CSRF middleware runs before these routes. Tasks use the returned guard.
export function installAuth(app, { User, secret, dummyHash, mailer, appOrigin,
  cookieName, production, captcha, verifyCaptcha, now = Date.now }) {
  const identity = makeIdentity({ User, secret, mailer, appOrigin, now });
  async function passwordAccount(body) {
    const { email, password } = credentials(body);
    const user = await User.findOne({ email }).select('+passwordHash');
    const correct = await verifyPassword(password, user?.passwordHash ?? dummyHash);
    if (!user || !correct) throw new AuthError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
    return user;
  }
  const pendingReply = (req, res) => res.status(202).json({ otpRequired: true,
    csrfToken: req.session.csrf, expiresInSeconds: OTP_MINUTES * 60, resendAfterSeconds: RESEND_SECONDS });

  app.get('/api/auth/pending', (req, res) => {
    const pending = req.session.pendingLogin;
    const active = Boolean(pending && pending.expiresAt > now());
    res.json({ otpRequired: active,
      expiresInSeconds: active ? Math.ceil((pending.expiresAt - now()) / 1000) : 0,
      resendAfterSeconds: active ? Math.max(0, Math.ceil((pending.resendAt - now()) / 1000)) : 0 });
  });
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = credentials(req.body);
    if (captcha?.enabled) await verifyCaptcha(req.body.captchaToken);
    const user = await User.create({ email, passwordHash: await hashPassword(password), emailVerifiedAt: null });
    await identity.sendVerification(user);
    res.status(201).json({ user: publicUser(user), message: 'Open the verification link in your email, then sign in.' });
  });
  app.get('/api/auth/verify-email', async (req, res) => {
    const verified = await identity.verifyEmail(req.query.token);
    // Verification alone never creates an authenticated session.
    res.set('Referrer-Policy', 'no-referrer');
    const destination = new URL('/', appOrigin);
    destination.searchParams.set('verification', verified ? 'success' : 'invalid');
    res.redirect(303, destination.href);
  });
  app.post('/api/auth/resend-verification', async (req, res) => {
    const user = await passwordAccount(req.body);
    if (user.emailVerifiedAt) return res.json({ message: 'Your email is already verified. Sign in to receive a login code.' });
    await identity.sendVerification(user);
    res.json({ message: 'A new verification link was sent. Only the newest link works.' });
  });
  app.post('/api/auth/login', async (req, res) => {
    const user = await passwordAccount(req.body);
    if (!user.emailVerifiedAt) throw new AuthError(403, 'Verify your email first. Open your email link, or use Resend verification link below.', 'EMAIL_UNVERIFIED');
    const pending = await identity.sendLoginCode(user);
    await regenerate(req);
    req.session.pendingLogin = pending; // No userId: protected routes stay closed.
    req.session.csrf = randomBytes(32).toString('hex');
    await save(req);
    pendingReply(req, res);
  });
  app.post('/api/auth/resend-otp', async (req, res) => {
    const pending = req.session.pendingLogin;
    if (!pending || pending.expiresAt <= now()) throw new AuthError(401, 'Start again with your email and password.', 'OTP_EXPIRED');
    const user = await User.findById(pending.userId);
    if (!user?.emailVerifiedAt) throw new AuthError(401, 'Start again with your email and password.', 'OTP_EXPIRED');
    req.session.pendingLogin = await identity.sendLoginCode(user);
    await save(req);
    pendingReply(req, res);
  });
  app.post('/api/auth/verify-otp', async (req, res) => {
    const user = await identity.consumeLoginCode(req.session.pendingLogin, req.body?.code);
    await regenerate(req);
    req.session.userId = String(user._id);
    req.session.otpVerified = true;
    req.session.csrf = randomBytes(32).toString('hex');
    await save(req);
    res.json({ user: publicUser(user), csrfToken: req.session.csrf });
  });
  async function requireUser(req, res, next) {
    if (!req.session.userId || req.session.otpVerified !== true) throw new AuthError(401, 'Sign in and enter your emailed code to continue.', 'SIGN_IN_REQUIRED');
    const user = await User.findById(req.session.userId);
    if (!user?.emailVerifiedAt) throw new AuthError(401, 'Verify your email and sign in to continue.', 'SIGN_IN_REQUIRED');
    req.user = user;
    next();
  }
  app.get('/api/auth/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));
  app.post('/api/auth/logout', async (req, res) => {
    await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    res.clearCookie(cookieName, { path: '/', httpOnly: true, sameSite: 'lax', secure: production });
    res.status(204).end();
  });
  return requireUser;
}
