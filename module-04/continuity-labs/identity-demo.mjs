import assert from 'node:assert/strict';
import { createVerificationStore, beginSignIn, finishSecondFactor } from './identity-state.mjs';

let now = 0;
const tokens = createVerificationStore(() => now);
const account = { id: 'learner', emailVerified: false, mfaEnabled: true };
assert.equal(beginSignIn(account, true, now).state, 'denied');
console.log('1. Unverified account: denied');
const token = tokens.issue(account.id, 'learner@example.test');
assert.equal(tokens.consume(token, account.id, 'learner@example.test'), true);
assert.equal(tokens.consume(token, account.id, 'learner@example.test'), false);
account.emailVerified = true; // Demonstration only: a real server updates persistent account state atomically.
console.log('2. Matching token consumed once; replay rejected');
const pending = beginSignIn(account, true, now);
assert.equal(pending.state, 'pending-mfa');
assert.equal(pending.userId, undefined);
console.log('3. Correct password: pending-mfa, no authenticated userId');
const fakeFactor = async (id, answer) => id === account.id && answer === 'fixture-only';
assert.equal((await finishSecondFactor(pending, 'wrong', fakeFactor, () => now)).state, 'denied');
const result = await finishSecondFactor(pending, 'fixture-only', fakeFactor, () => now);
assert.equal(result.state, 'authenticated');
assert.equal((await finishSecondFactor(pending, 'fixture-only', fakeFactor, () => now)).state, 'denied');
console.log('4. Fixture factor accepted once; challenge replay rejected');
console.log('Local state exercise only: no email, real factor, database, browser, or session integration.');
