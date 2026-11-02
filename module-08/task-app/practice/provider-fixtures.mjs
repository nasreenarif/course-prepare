import { mockPlan } from '../server/ai.js';
const candidate = (parts, finishReason = 'STOP') => ({ candidates: [{ finishReason, content: { role: 'model', parts } }] });
const success = () => candidate([{ text: JSON.stringify(mockPlan('fixture goal')) }]);
const json = body => async () => ({ ok: true, json: async () => body });
export const providerCases = [
  { name: 'success', expected: 'PLAN', fetchImpl: json(success()) },
  { name: 'blocked prompt', expected: 'AI_REFUSED', fetchImpl: json({ promptFeedback: { blockReason: 'SAFETY' } }) },
  { name: 'blocked candidate', expected: 'AI_REFUSED', fetchImpl: json(candidate([], 'SAFETY')) },
  { name: 'token limit', expected: 'AI_INCOMPLETE', fetchImpl: json(candidate([{ text: '{"summary":' }], 'MAX_TOKENS')) },
  { name: 'invalid output text', expected: 'AI_FORMAT', fetchImpl: json(candidate([{ text: '{broken' }])) },
  { name: 'invalid envelope JSON', expected: 'AI_FORMAT', fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('fixture'); } }) },
  { name: 'wrong plan shape', expected: 'AI_FORMAT', fetchImpl: json(candidate([{ text: '{"summary":"x","steps":[]}' }])) },
  { name: 'missing candidates', expected: 'AI_FORMAT', fetchImpl: json({ candidates: [] }) },
  { name: 'provider rate limit', expected: 'AI_BUSY', fetchImpl: async () => ({ ok: false, status: 429 }) },
  { name: 'key permission failure', expected: 'AI_CONFIGURATION', fetchImpl: async () => ({ ok: false, status: 403 }) },
  { name: 'unavailable model', expected: 'AI_CONFIGURATION', fetchImpl: async () => ({ ok: false, status: 404 }) },
  { name: 'network failure', expected: 'AI_UNAVAILABLE', fetchImpl: async () => { throw new Error('fixture network'); } },
  { name: 'timeout', expected: 'AI_TIMEOUT', fetchImpl: async () => { throw new DOMException('fixture', 'TimeoutError'); } }
];
