// Optional extension helper. See lesson 4.14 for all integration changes.
export function readPriority(value) {
  if (!['low', 'normal', 'high'].includes(value)) {
    throw Object.assign(new Error('Priority must be low, normal, or high.'), { status: 400 });
  }
  return value;
}
