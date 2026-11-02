import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { goalInput, aiSettings, mockPlan, readResponse, makeAIService, instructions } from './ai.js';
import { validPlan, planSchema } from '../shared/plan.js';
import { createApp, verifyAccount, finishLogin } from './auth-fixtures.js';
import { models } from './model-doubles.js';

const envelope = plan => ({ candidates: [{ finishReason: 'STOP', content: { role: 'model', parts: [{ text: JSON.stringify(plan) }] } }] });
const settings = { mode: 'live', key: 'fixture-secret', model: 'gemini-fixture' };

test('Gemini configuration separates off/mock/live and requires live credentials', () => {
  assert.equal(aiSettings({}).mode, 'off');
  assert.equal(aiSettings({ AI_MODE: 'mock' }).mode, 'mock');
  for (const env of [{ AI_MODE: 'unknown' }, { AI_MODE: 'live' }, { AI_MODE: 'mock', NODE_ENV: 'production' }]) assert.throws(() => aiSettings(env));
  assert.deepEqual(aiSettings({ AI_MODE: 'live', GEMINI_API_KEY: ' fixture ', GEMINI_MODEL: ' models/gemini-3.5-flash-lite ' }),
    { mode: 'live', key: 'fixture', model: 'gemini-3.5-flash-lite' });
});

test('live settings reject blank keys, placeholders, and invalid model paths', () => {
  for (const key of ['', '   ', 'your-key-here', 'replace-this', 'one\ntwo']) {
    assert.throws(() => aiSettings({ AI_MODE: 'live', GEMINI_API_KEY: key, GEMINI_MODEL: 'gemini-fixture' }), /GEMINI_API_KEY/);
  }
  for (const model of ['', 'https://example.test/model', '../other', 'gemini-x?key=value', 'gemini-x/other']) {
    assert.throws(() => aiSettings({ AI_MODE: 'live', GEMINI_API_KEY: 'fixture', GEMINI_MODEL: model }), /GEMINI_MODEL/);
  }
});

test('goal contract rejects extra fields, wrong types, whitespace, and excess length', () => {
  assert.equal(goalInput({ goal: '  build a form  ' }), 'build a form');
  assert.equal(goalInput({ goal: 'x'.repeat(1000) }).length, 1000);
  for (const body of [null, [], {}, { goal: '' }, { goal: '  ' }, { goal: 42 }, { goal: 'x'.repeat(1001) }, { goal: 'x', model: 'chosen-by-client' }]) {
    assert.throws(() => goalInput(body), e => e.status === 400);
  }
});

test('plan contract enforces cardinality, lengths, and no unexpected properties', () => {
  const plan = mockPlan('practice'); assert.ok(validPlan(plan));
  for (const invalid of [null, { ...plan, owner: 'other' }, { ...plan, steps: [] }, { ...plan, steps: Array(6).fill(plan.steps[0]) },
    { ...plan, summary: 'x'.repeat(601) }, { ...plan, steps: [{ title: 'x', reason: ' ' }] }, { ...plan, steps: [{ ...plan.steps[0], script: 'bad' }] }]) {
    assert.equal(validPlan(invalid), false);
  }
});

test('Gemini parser joins answer parts and excludes thought parts', () => {
  const plan = mockPlan('goal'); const text = JSON.stringify(plan); const response = envelope(plan);
  response.candidates[0].content.parts = [{ thought: true, text: 'not answer JSON' }, { text: text.slice(0, 30) }, { text: text.slice(30) }];
  response.usageMetadata = { totalTokenCount: 123 };
  assert.deepEqual(readResponse(response), plan);
});

test('prompt and candidate safety blocks reject even otherwise valid text', () => {
  assert.throws(() => readResponse({ promptFeedback: { blockReason: 'SAFETY' } }), e => e.code === 'AI_REFUSED');
  for (const reason of ['SAFETY', 'RECITATION', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII']) {
    const response = envelope(mockPlan('x')); response.candidates[0].finishReason = reason;
    assert.throws(() => readResponse(response), e => e.code === 'AI_REFUSED');
  }
  const response = envelope(mockPlan('x')); response.candidates[0].safetyRatings = [{ blocked: true }];
  assert.throws(() => readResponse(response), e => e.code === 'AI_REFUSED');
});

test('truncation, missing finish status, and unknown finish reasons reject partial drafts', () => {
  for (const reason of ['MAX_TOKENS', undefined, 'OTHER', 'FUTURE_REASON']) {
    const response = envelope(mockPlan('x')); response.candidates[0].finishReason = reason;
    assert.throws(() => readResponse(response), e => e.code === 'AI_INCOMPLETE');
  }
});

test('empty, multiple, or malformed candidates and invalid plan JSON stay rejected', () => {
  const valid = envelope(mockPlan('x'));
  const malformed = envelope(mockPlan('x')); malformed.candidates[0].content.parts = [{ text: '{broken' }];
  for (const response of [null, {}, { candidates: [] }, { candidates: [null] }, { candidates: [...valid.candidates, ...valid.candidates] },
    { candidates: [{ finishReason: 'STOP' }] }, malformed, envelope({ summary: 'x', steps: [] })]) {
    assert.throws(() => readResponse(response), e => e.code === 'AI_FORMAT');
  }
});

test('thought-only and tool-call content cannot be treated as an accepted draft', () => {
  for (const parts of [[{ thought: true, text: '{}' }], [{ functionCall: { name: 'saveTask' } }], [{ text: 4 }], [null],
    [{ text: JSON.stringify(mockPlan('x')), executableCode: { code: 'untrusted' } }]]) {
    assert.throws(() => readResponse({ candidates: [{ finishReason: 'STOP', content: { parts } }] }), e => e.code === 'AI_FORMAT');
  }
});

test('mock/off never call an external provider', async () => {
  const fetchImpl = () => { throw new Error('unexpected external request'); };
  assert.ok(validPlan(await makeAIService({ mode: 'mock' }, { fetchImpl }).generate('x')));
  await assert.rejects(makeAIService({ mode: 'off' }, { fetchImpl }).generate('x'), e => e.code === 'AI_DISABLED');
});

test('live request uses Gemini endpoint, header key, separate instructions, schema, and no tools', async () => {
  let calls = 0;
  const service = makeAIService(settings, { fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-fixture:generateContent');
    assert.equal(new URL(url).search, '');
    assert.equal(options.headers['x-goog-api-key'], settings.key);
    assert.equal(options.redirect, 'error'); assert.ok(options.signal);
    const body = JSON.parse(options.body);
    assert.equal(body.systemInstruction.parts[0].text, instructions);
    assert.deepEqual(body.contents, [{ role: 'user', parts: [{ text: JSON.stringify({ goal: 'test goal' }) }] }]);
    assert.deepEqual(body.generationConfig, { candidateCount: 1, maxOutputTokens: 4096, responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: planSchema } } });
    assert.equal(body.tools, undefined); assert.equal(body.safetySettings, undefined);
    assert.equal(JSON.stringify(body).includes(settings.key), false);
    return { ok: true, json: async () => envelope(mockPlan('x')) };
  } });
  assert.ok(validPlan(await service.generate('test goal'))); assert.equal(calls, 1);
});

test('provider HTTP errors map to safe actionable codes without exposing response bodies or retrying', async () => {
  for (const [status, code] of [[429, 'AI_BUSY'], [400, 'AI_CONFIGURATION'], [401, 'AI_CONFIGURATION'], [403, 'AI_CONFIGURATION'], [404, 'AI_CONFIGURATION'], [500, 'AI_UNAVAILABLE']]) {
    let calls = 0;
    const fetchImpl = async () => { calls++; return { ok: false, status, json: async () => { throw new Error('must not read private provider body'); } }; };
    await assert.rejects(makeAIService(settings, { fetchImpl }).generate('x'), e => e.code === code && !e.message.includes(settings.key));
    assert.equal(calls, 1);
  }
});

test('network and request/body timeout failures stay safe', async () => {
  for (const [fetchImpl, code] of [
    [async () => { throw new Error('fixture private details'); }, 'AI_UNAVAILABLE'],
    [async () => { throw new DOMException('fixture', 'TimeoutError'); }, 'AI_TIMEOUT'],
    [async () => ({ ok: true, json: async () => { throw new DOMException('fixture', 'AbortError'); } }), 'AI_TIMEOUT'],
    [async () => ({ ok: true, json: async () => { throw new SyntaxError('fixture'); } }), 'AI_FORMAT']
  ]) {
    await assert.rejects(makeAIService(settings, { fetchImpl }).generate('x'), e => e.code === code && !e.message.includes('private details'));
  }
});

async function account(app,email='learner@example.test') {
 const agent=request.agent(app);let csrf=(await agent.get('/api/auth/csrf')).body.csrfToken;
 const body={email,password:'Practice passphrase for tests!'};
 await agent.post('/api/auth/register').set('X-CSRF-Token',csrf).send(body).expect(201);
 await verifyAccount(app,email);
 const pending=await agent.post('/api/auth/login').set('X-CSRF-Token',csrf).send(body).expect(202);
 const login=await finishLogin(app,agent,pending,email);
 return {agent,csrf:login.body.csrfToken};
}
const base=()=>({...models(),secret:'test-only-secret-at-least-32-characters',limiter:false});
test('AI route rejects missing CSRF, guest, invalid goal before provider; draft creates no tasks',async()=>{
 let calls=0;const app=createApp({...base(),ai:{mode:'mock',generate:async goal=>{calls++;return mockPlan(goal);}}});
 await request(app).post('/api/ai/plans').send({goal:'x'}).expect(403);
 const guest=request.agent(app);const token=(await guest.get('/api/auth/csrf')).body.csrfToken;
 await guest.post('/api/ai/plans').set('X-CSRF-Token',token).send({goal:'x'}).expect(401);
 const {agent,csrf}=await account(app);
 await agent.post('/api/ai/plans').set('X-CSRF-Token',csrf).send({goal:' '}).expect(400);assert.equal(calls,0);
 const result=await agent.post('/api/ai/plans').set('X-CSRF-Token',csrf).send({goal:'Make a study plan'}).expect(200);
 assert.ok(validPlan(result.body.plan));assert.equal(result.body.mode,'mock');assert.equal(calls,1);
 assert.deepEqual((await agent.get('/api/tasks')).body.tasks,[]);
});
test('AI quota applies per authenticated account',async()=>{
 const app=createApp({...base(),ai:makeAIService({mode:'mock'}),aiLimit:1});
 const a=await account(app,'a@example.test'),b=await account(app,'b@example.test');
 await a.agent.post('/api/ai/plans').set('X-CSRF-Token',a.csrf).send({goal:'x'}).expect(200);
 const denied=await a.agent.post('/api/ai/plans').set('X-CSRF-Token',a.csrf).send({goal:'x'}).expect(429);assert.equal(denied.body.code,'AI_RATE_LIMIT');
 await b.agent.post('/api/ai/plans').set('X-CSRF-Token',b.csrf).send({goal:'x'}).expect(200);
});
test('one in-flight request per account; failure releases the slot',async()=>{
 let entered,release;const started=new Promise(resolve=>{entered=resolve;});let first=true;
 const app=createApp({...base(),ai:{mode:'mock',generate:async goal=>{
  if(first){first=false;entered();await new Promise(resolve=>{release=resolve;});throw new Error('fixture failure');}
  return mockPlan(goal);
 }}});const {agent,csrf}=await account(app);
 const pending=agent.post('/api/ai/plans').set('X-CSRF-Token',csrf).send({goal:'x'}).then(result=>result);
 await started;
 const duplicate=await agent.post('/api/ai/plans').set('X-CSRF-Token',csrf).send({goal:'x'}).expect(409);assert.equal(duplicate.body.code,'AI_IN_PROGRESS');
 release();assert.equal((await pending).status,500);
 await agent.post('/api/ai/plans').set('X-CSRF-Token',csrf).send({goal:'x'}).expect(200);
});


test('signed-in Gemini draft passes through the adapter without creating a task', async () => {
  let calls = 0;
  const ai = makeAIService(settings, { fetchImpl: async () => {
    calls++;
    return { ok: true, json: async () => envelope(mockPlan('Gemini fixture')) };
  } });
  const app = createApp({ ...base(), ai });
  const { agent, csrf } = await account(app);
  const response = await agent.post('/api/ai/plans').set('X-CSRF-Token', csrf).send({ goal: 'Build a checklist' }).expect(200);
  assert.equal(response.body.mode, 'live');
  assert.equal(response.body.promptVersion, 'planner-gemini-v1');
  assert.ok(validPlan(response.body.plan));
  assert.equal(JSON.stringify(response.body).includes(settings.key), false);
  assert.equal(calls, 1);
  assert.deepEqual((await agent.get('/api/tasks')).body.tasks, []);
  await agent.post('/api/tasks').set('X-CSRF-Token', csrf).send({ title: response.body.plan.steps[0].title }).expect(201);
  assert.equal((await agent.get('/api/tasks')).body.tasks.length, 1);
});

test('Gemini configuration failure stays safe at the route and releases the request slot', async () => {
  let calls = 0;
  const ai = makeAIService(settings, { fetchImpl: async () => {
    calls++;
    return calls === 1 ? { ok: false, status: 403 } : { ok: true, json: async () => envelope(mockPlan('retry fixture')) };
  } });
  const app = createApp({ ...base(), ai });
  const { agent, csrf } = await account(app);
  const failure = await agent.post('/api/ai/plans').set('X-CSRF-Token', csrf).send({ goal: 'Practice' }).expect(503);
  assert.equal(failure.body.code, 'AI_CONFIGURATION');
  assert.equal(JSON.stringify(failure.body).includes(settings.key), false);
  assert.ok(failure.body.requestId);
  assert.deepEqual((await agent.get('/api/tasks')).body.tasks, []);
  await agent.post('/api/ai/plans').set('X-CSRF-Token', csrf).send({ goal: 'Practice' }).expect(200);
  assert.equal(calls, 2);
});
