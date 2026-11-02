// Incremental teaching scope: new pure quality labs, not the whole React app.
export default [{
  files: ['quality/**/*.mjs'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { console: 'readonly' } },
  rules: { 'no-undef': 'error', 'no-unused-vars': 'error', eqeqeq: ['error', 'always'],
    'no-unreachable': 'error', 'no-constant-condition': 'error' }
}];
