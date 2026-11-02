export function titleError(value) {
  if (!value.trim()) return 'Enter a title.';
  if (value.trim().length > 200) return 'Use 200 characters or fewer.';
  return '';
}
