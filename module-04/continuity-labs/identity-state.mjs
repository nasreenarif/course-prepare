// In-memory teaching model only: NOT an email sender, TOTP verifier or Express integration.
import { randomBytes, createHash } from 'node:crypto';
const digest = value => createHash('sha256').update(value).digest('hex');
export function createVerificationStore(now = Date.now) {
  const records = new Map();
  return {
    issue(userId, email) {
      // Reissue invalidates older tokens for this account in this single-process model.
      for (const [hash, record] of records) if (record.userId === userId) records.delete(hash);
      const token = randomBytes(32).toString('hex');
      records.set(digest(token), { userId, email, expiresAt: now() + 15 * 60 * 1000 });
      return token; // A real server passes this to a delivery adapter, not a public API response.
    },
    consume(token, userId, currentEmail) {
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
      const hash = digest(token), record = records.get(hash);
      if (!record || record.userId !== userId || record.email !== currentEmail) return false;
      records.delete(hash); // Synchronous consume in this local model only.
      return record.expiresAt > now();
    }
  };
}
export function beginSignIn(account, passwordVerified, now) {
  // account and passwordVerified must come from trusted server operations.
  if (passwordVerified !== true || account.emailVerified !== true) return { state: 'denied' };
  if (account.mfaEnabled) return { state: 'pending-mfa', pendingUserId: account.id, expiresAt: now + 300000, attemptsLeft: 5 };
  return { state: 'authenticated', userId: account.id };
}
export async function finishSecondFactor(pending, code, verifyFactor, clock = Date.now) {
  if (pending.state !== 'pending-mfa' || clock() >= pending.expiresAt || pending.attemptsLeft <= 0) {
    pending.state = 'denied'; return { state: 'denied' };
  }
  // Claim the attempt before awaiting; a concurrent attempt must not consume it again.
  pending.state = 'checking'; pending.attemptsLeft -= 1;
  let accepted;
  try { accepted = await verifyFactor(pending.pendingUserId, code); }
  catch (error) { pending.state = 'denied'; throw error; }
  if (pending.state !== 'checking' || clock() >= pending.expiresAt) {
    pending.state = 'denied'; return { state: 'denied' };
  }
  if (accepted !== true) {
    pending.state = pending.attemptsLeft > 0 ? 'pending-mfa' : 'denied';
    return { state: 'denied' };
  }
  pending.state = 'consumed';
  return { state: 'authenticated', userId: pending.pendingUserId };
}
