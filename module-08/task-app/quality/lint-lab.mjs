import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
const root = fileURLToPath(new URL('../', import.meta.url));
const executable = fileURLToPath(new URL('../node_modules/eslint/bin/eslint.js', import.meta.url));
const cases = [
  { name: 'unused variable', text: 'const abandoned = 1;', exit: 1, rule: 'no-unused-vars' },
  { name: 'undefined name', text: 'console.log(missingValue);', exit: 1, rule: 'no-undef' },
  { name: 'loose comparison', text: 'export const same = (a, b) => a == b;', exit: 1, rule: 'eqeqeq' },
  { name: 'corrected example', text: 'export const same = (a, b) => a === b;', exit: 0 }
];
for (const item of cases) {
  // Sends text to stdin; never writes faulty source into the project.
  const run = spawnSync(process.execPath, [executable, '--stdin', '--stdin-filename', 'quality/probe.mjs', '--format', 'json'],
    { cwd: root, input: item.text, encoding: 'utf8', timeout: 10000 });
  if (run.error) throw run.error;
  assert.equal(run.status, item.exit, run.stderr);
  const messages = JSON.parse(run.stdout).flatMap(result => result.messages);
  if (item.rule) assert.ok(messages.some(message => message.ruleId === item.rule));
  else assert.equal(messages.length, 0);
  console.log(`${item.name}: expected exit ${item.exit}; ${messages.map(message => message.ruleId).join(', ') || 'no diagnostics'}`);
}
console.log('All four expected outcomes confirmed. These snippets were linted, not executed.');
