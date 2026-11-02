import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export class AuthError extends Error {
  constructor(status, message, code) {
    super(message);
    Object.assign(this, { status, code, fields: {} });
  }
}
export const LINK_MINUTES = 30;
export const OTP_MINUTES = 5;
export const RESEND_SECONDS = 60;
export const MAX_OTP_ATTEMPTS = 5;
const hashToken = token => createHash('sha256').update(token).digest('hex');

// MongoDB stores digests, expiry times, and attempt counts, never the email's secrets.
export function makeIdentity({ User, mailer, secret, appOrigin, now = Date.now }) {
  const codeHash = (userId, challenge, code) => createHmac('sha256', secret)
    .update(`${userId}:${challenge}:${code}`).digest('hex');
  const cooldown = field => ({ $or: [
    { [field]: null }, { [field]: { $lte: new Date(now() - RESEND_SECONDS * 1000) } }
  ] });
  async function deliver(message, invalidate) {
    try {
      if (!mailer || typeof mailer.sendMail !== 'function') throw new Error('mail not configured');
      await mailer.sendMail(message);
    } catch {
      await invalidate();
      throw new AuthError(503, 'Email could not be sent. Check the Gmail setup, wait 60 seconds, then try again.', 'MAIL_UNAVAILABLE');
    }
  }
  return {
    async sendVerification(user) {
      const token = randomBytes(32).toString('hex');
      const digest = hashToken(token);
      const saved = await User.findOneAndUpdate({ _id: user._id, emailVerifiedAt: null, ...cooldown('verificationSentAt') }, {
        $set: { verificationTokenHash: digest, verificationExpiresAt: new Date(now() + LINK_MINUTES * 60000), verificationSentAt: new Date(now()) }
      }, { new: true });
      if (!saved) throw new AuthError(429, 'Wait 60 seconds before requesting another verification link.', 'EMAIL_COOLDOWN');
      const url = new URL('/api/auth/verify-email', appOrigin);
      url.searchParams.set('token', token);
      await deliver({ to: user.email, subject: 'Verify your CS418 practice account',
        text: `Click this link to verify your email address:\n${url.href}\n\nThe link expires in ${LINK_MINUTES} minutes and can be used once. It does not sign you in. If you did not register, ignore this email.`
      }, () => User.updateOne({ _id: user._id, verificationTokenHash: digest }, { $unset: { verificationTokenHash: '', verificationExpiresAt: '' } }));
    },
    async verifyEmail(token) {
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
      // The conditional update consumes the link once, even with concurrent clicks.
      const user = await User.findOneAndUpdate({ verificationTokenHash: hashToken(token),
        verificationExpiresAt: { $gt: new Date(now()) }, emailVerifiedAt: null
      }, { $set: { emailVerifiedAt: new Date(now()) }, $unset: { verificationTokenHash: '', verificationExpiresAt: '' } }, { new: true });
      return Boolean(user);
    },
    async sendLoginCode(user) {
      const challenge = randomBytes(32).toString('hex');
      const code = String(randomInt(0, 1000000)).padStart(6, '0');
      const expiresAt = now() + OTP_MINUTES * 60000;
      const digest = codeHash(String(user._id), challenge, code);
      const saved = await User.findOneAndUpdate({ _id: user._id, emailVerifiedAt: { $ne: null }, ...cooldown('loginCodeSentAt') }, {
        $set: { loginChallenge: challenge, loginCodeHash: digest, loginCodeExpiresAt: new Date(expiresAt), loginCodeAttempts: 0, loginCodeSentAt: new Date(now()) }
      }, { new: true });
      if (!saved) throw new AuthError(429, 'Wait 60 seconds before requesting another login code.', 'OTP_COOLDOWN');
      await deliver({ to: user.email, subject: 'Your CS418 sign-in code',
        text: `Your sign-in code is: ${code}\n\nIt expires in ${OTP_MINUTES} minutes. Enter it in the browser where you entered your password. Use the newest code only. If you did not request this code, do not share it or enter it.`
      }, () => User.updateOne({ _id: user._id, loginChallenge: challenge }, { $unset: { loginChallenge: '', loginCodeHash: '', loginCodeExpiresAt: '' } }));
      return { userId: String(user._id), challenge, expiresAt, resendAt: now() + RESEND_SECONDS * 1000 };
    },
    async consumeLoginCode(pending, code) {
      if (!pending || pending.expiresAt <= now()) throw new AuthError(401, 'The login attempt expired. Start again with your email and password.', 'OTP_EXPIRED');
      if (typeof code !== 'string' || !/^\d{6}$/.test(code)) throw new AuthError(400, 'Enter the six digits from your email.', 'OTP_FORMAT');
      // Increment before comparing: parallel requests cannot bypass the attempt limit.
      const user = await User.findOneAndUpdate({ _id: pending.userId, loginChallenge: pending.challenge,
        emailVerifiedAt: { $ne: null }, loginCodeExpiresAt: { $gt: new Date(now()) }, loginCodeAttempts: { $lt: MAX_OTP_ATTEMPTS }
      }, { $inc: { loginCodeAttempts: 1 } }, { new: true }).select('+loginCodeHash');
      if (!user) throw new AuthError(401, 'This code expired, was replaced, or reached its attempt limit. Request a new code or start again.', 'OTP_INVALID');
      const expected = Buffer.from(user.loginCodeHash, 'hex');
      const supplied = Buffer.from(codeHash(String(user._id), pending.challenge, code), 'hex');
      if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
        throw new AuthError(401, 'Incorrect code. You have at most five attempts per code.', 'OTP_INVALID');
      }
      // A second conditional update makes a correct code single-use.
      const accepted = await User.findOneAndUpdate({ _id: user._id, loginChallenge: pending.challenge,
        loginCodeHash: user.loginCodeHash, loginCodeExpiresAt: { $gt: new Date(now()) }, emailVerifiedAt: { $ne: null }
      }, { $unset: { loginChallenge: '', loginCodeHash: '', loginCodeExpiresAt: '' } }, { new: true });
      if (!accepted) throw new AuthError(401, 'This code has already been used or replaced. Start again.', 'OTP_INVALID');
      return accepted;
    }
  };
}
