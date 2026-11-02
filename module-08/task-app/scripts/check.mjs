import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../', import.meta.url));
const windows = process.platform === 'win32';
const steps = [
  ['run','lint'],
  ['run','lab:lint'],
  ['run','test:quality'],
  ['--prefix','server','test'],
  ['--prefix','client','test'],
  ['run','test:practice'],
  ['--prefix','client','run','build']
];
for (const args of steps) {
  console.log(`Checking: npm ${args.join(' ')}`);
  const result = spawnSync(windows ? 'npm.cmd' : 'npm', args, { cwd, stdio:'inherit', shell:windows });
  if (result.error || result.status !== 0) {
    console.error('Verification stopped at the first failed step.');
    process.exit(result.status || 1);
  }
}
console.log('Local checks passed. Live database, hosting, and Canvas checks remain separate.');
