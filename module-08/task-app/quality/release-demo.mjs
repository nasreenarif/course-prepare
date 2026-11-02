import assert from 'node:assert/strict';
import { releaseDecision } from './release-gate.mjs';
// Fictional teaching evidence, not this package's deployment results.
const checks = [
  { id: 'local-tests', status: 'pass', evidence: 'Example test log at a specific commit' },
  { id: 'hosted-login', status: 'not-run', evidence: '' }
];
const result = releaseDecision(checks);
assert.deepEqual(result, { ready: false, blockers: ['hosted-login'] });
console.log(JSON.stringify(result, null, 2));
console.log('Not-run remains unresolved. A helper cannot verify that evidence is truthful or complete.');
