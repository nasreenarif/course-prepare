// This helper summarizes supplied evidence; it does NOT execute any checks.
export function releaseDecision(checks) {
  if (!Array.isArray(checks) || checks.length === 0) throw new TypeError('supply required checks');
  const ids = new Set();
  for (const check of checks) {
    if (!check || typeof check.id !== 'string' || !check.id.trim() || ids.has(check.id)) throw new TypeError('unique check ids required');
    if (!['pass', 'fail', 'not-run'].includes(check.status)) throw new TypeError('invalid status');
    if (typeof check.evidence !== 'string') throw new TypeError('evidence must be text');
    ids.add(check.id);
  }
  const blockers = checks.filter(check => check.status !== 'pass' || !check.evidence.trim()).map(check => check.id);
  return { ready: blockers.length === 0, blockers };
}
