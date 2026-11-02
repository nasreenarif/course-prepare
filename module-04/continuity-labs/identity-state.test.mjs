import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerificationStore, beginSignIn, finishSecondFactor } from './identity-state.mjs';
test('verification token is bound, single-use and invalidated on resend', () => {
  const store = createVerificationStore(() => 0);
  const first = store.issue('a', 'a@example.test');
  assert.equal(store.consume(first, 'b', 'a@example.test'), false);
  assert.equal(store.consume(first, 'a', 'changed@example.test'), false);
  const second = store.issue('a', 'a@example.test');
  assert.equal(store.consume(first, 'a', 'a@example.test'), false);
  assert.equal(store.consume(second, 'a', 'a@example.test'), true);
  assert.equal(store.consume(second, 'a', 'a@example.test'), false);
});
test('verification token expires at its deadline', () => {
  let time = 0; const store = createVerificationStore(() => time);
  const token = store.issue('a', 'a@example.test'); time = 900000;
  assert.equal(store.consume(token, 'a', 'a@example.test'), false);
});
const account = { id: 'a', emailVerified: true, mfaEnabled: true };
test('password failure and unverified email do not authorize', () => {
  assert.equal(beginSignIn(account, false, 0).state, 'denied');
  assert.equal(beginSignIn({ ...account, emailVerified: false }, true, 0).state, 'denied');
});
test('pending MFA never has authenticated userId; success consumes the challenge', async () => {
  const pending = beginSignIn(account, true, 0);
  assert.equal(pending.userId, undefined);
  const result = await finishSecondFactor(pending, 'fixture-only', async id => id === 'a', () => 1);
  assert.deepEqual(result, { state: 'authenticated', userId: 'a' });
  assert.equal((await finishSecondFactor(pending, 'fixture-only', async () => true, () => 2)).state, 'denied');
});
test('wrong factor exhausts the bounded attempts', async () => {
  const pending = beginSignIn(account, true, 0);
  for (let i=0;i<5;i++) assert.equal((await finishSecondFactor(pending, 'wrong', async () => false, () => 1)).state, 'denied');
  assert.equal(pending.state, 'denied');
});
test('expired challenge and provider failure do not authorize', async () => {
  const expired = beginSignIn(account, true, 0);
  assert.equal((await finishSecondFactor(expired, 'fixture', async () => true, () => 300000)).state, 'denied');
  const pending = beginSignIn(account, true, 0);
  await assert.rejects(() => finishSecondFactor(pending, 'fixture', async () => { throw new Error('unavailable'); }, () => 1));
  assert.equal(pending.state, 'denied');
});
test('challenge cannot expire while awaiting a successful verifier', async () => {
  let time = 0;
  const pending = beginSignIn(account, true, time);
  const result = await finishSecondFactor(pending, 'fixture', async () => { time = 300000; return true; }, () => time);
  assert.equal(result.state, 'denied');
});
