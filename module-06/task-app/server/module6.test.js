import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp, verifyAccount, finishLogin } from './auth-fixtures.js';
import { models } from './model-doubles.js';
import { captchaSettings, makeCaptchaVerifier } from './captcha.js';
const base = () => ({ ...models(), secret:'test-only-long-secret-with-32-characters', limiter:false });
const result = body => async () => ({ ok:true, json:async () => body });
test('CAPTCHA configuration rejects incomplete and production-disabled settings', () => {
  assert.equal(captchaSettings({}).enabled,false);
  assert.throws(() => captchaSettings({ NODE_ENV:'production', CAPTCHA_ENABLED:'false' }));
  assert.throws(() => captchaSettings({ CAPTCHA_ENABLED:'yes' }));
  assert.throws(() => captchaSettings({ CAPTCHA_ENABLED:'true' }));
  assert.equal(captchaSettings({ CAPTCHA_ENABLED:'true', RECAPTCHA_SITE_KEY:'public', RECAPTCHA_SECRET_KEY:'private', RECAPTCHA_HOSTNAMES:'localhost, example.test' }).hostnames.length,2);
});
test('CAPTCHA verifies token type, provider success, and exact hostname', async () => {
  const options = { secret:'test-private', hostnames:['localhost'] };
  const verify = makeCaptchaVerifier({ ...options, fetchImpl:result({ success:true, hostname:'localhost' }) });
  for (const value of [null, '', {}, 'x'.repeat(4097)]) await assert.rejects(verify(value), e => e.code === 'CAPTCHA_REQUIRED');
  await verify('fixture-token');
  for (const body of [{success:false}, {success:true,hostname:'attacker.localhost'}, {success:true}]) {
    await assert.rejects(makeCaptchaVerifier({...options,fetchImpl:result(body)})('fixture'), e => e.code === 'CAPTCHA_REJECTED');
  }
});
test('CAPTCHA outage and malformed provider data fail closed', async () => {
  for (const fetchImpl of [async () => { throw new Error('network'); }, result(null), result({success:'true'}), async () => ({ok:false})]) {
    await assert.rejects(makeCaptchaVerifier({secret:'private',hostnames:['localhost'],fetchImpl})('fixture'),e => e.status === 503);
  }
});
test('CAPTCHA sends credentials in a POST body with a bounded signal', async () => {
  const verify = makeCaptchaVerifier({secret:'private',hostnames:['localhost'],fetchImpl:async (url,options) => {
    assert.equal(url,'https://www.google.com/recaptcha/api/siteverify');
    assert.equal(options.method,'POST'); assert.equal(options.body.get('secret'),'private');
    assert.equal(options.body.get('response'),'fixture'); assert.ok(options.signal);
    return {ok:true,json:async()=>({success:true,hostname:'localhost'})};
  }}); await verify('fixture');
});
test('public configuration exposes no secret and headers cover errors', async () => {
  const app=createApp({...base(),captcha:{enabled:true,siteKey:'public',secret:'private'},verifyCaptcha:async()=>{}});
  const config=await request(app).get('/api/config').expect(200);
  assert.deepEqual(config.body,{captcha:{enabled:true,siteKey:'public'}});
  assert.equal(config.headers['cache-control'],'no-store');
  const response=await request(app).get('/api/missing').expect(404);
  assert.equal(response.headers['x-frame-options'],'DENY');
  assert.match(response.headers['content-security-policy'],/frame-ancestors 'none'/);
  assert.match(response.headers['content-security-policy'],/www.google.com\/recaptcha/);
  assert.equal(response.headers['x-content-type-options'],'nosniff');
  assert.equal(response.headers['strict-transport-security'],undefined);
});
test('production responses add HSTS, while disabled CAPTCHA policy excludes provider', async () => {
  const response=await request(createApp({...base(),production:true})).get('/api/health').expect(200);
  assert.equal(response.headers['strict-transport-security'],'max-age=31536000');
  assert.doesNotMatch(response.headers['content-security-policy'],/google/);
});
test('rejected verification cannot create an account; successful verification can', async () => {
  const store=models(); let creates=0,verifications=0;
  const original=store.User.create;
  store.User.create=async data => {creates++;return original(data);};
  const verifier=makeCaptchaVerifier({secret:'private',hostnames:['localhost'],fetchImpl:result({success:true,hostname:'localhost'})});
  const app=createApp({...base(),...store,captcha:{enabled:true,siteKey:'public'},verifyCaptcha:async token => {verifications++;await verifier(token);}});
  const agent=request.agent(app); const csrf=(await agent.get('/api/auth/csrf')).body.csrfToken;
  const body={email:'practice@example.test',password:'A practice password 123'};
  await agent.post('/api/auth/register').send(body).expect(403);
  assert.equal(verifications,0);
  await agent.post('/api/auth/register').set('X-CSRF-Token',csrf).send(body).expect(400);
  assert.equal(creates,0);
  await agent.post('/api/auth/register').set('X-CSRF-Token',csrf).send({...body,captchaToken:'fixture'}).expect(201);
  assert.equal(creates,1);
});
