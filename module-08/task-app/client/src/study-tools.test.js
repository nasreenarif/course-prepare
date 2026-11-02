import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, allowedResourceUrl } from './study-tools.js';
test('contrast: reference ratios, symmetry, and malformed colors',()=>{
  assert.equal(contrastRatio('#000000','#ffffff'),21);
  assert.equal(contrastRatio('#ffffff','#ffffff'),1);
  assert.equal(contrastRatio('#174ca1','#ffffff'),contrastRatio('#ffffff','#174ca1'));
  assert.ok(contrastRatio('#174ca1','#ffffff')>8);
  assert.ok(contrastRatio('#777777','#ffffff')<4.5);
  for(const color of ['red','#fff','#12345g',null])assert.throws(()=>contrastRatio(color,'#ffffff'));
});
test('resource URL policy accepts HTTPS and rejects unwanted contexts',()=>{
  assert.equal(allowedResourceUrl('https://example.com/help'),'https://example.com/help');
  for(const value of ['javascript:alert(1)','data:text/html,hello','http://example.com','/relative','https://user:pass@example.com',null,{}])assert.equal(allowedResourceUrl(value),null);
  assert.equal(allowedResourceUrl('https://unreviewed.example/'),'https://unreviewed.example/');
  // HTTPS-only is not a reputation check or an SSRF policy.
});
