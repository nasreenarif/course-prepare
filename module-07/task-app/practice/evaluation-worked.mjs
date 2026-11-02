import assert from 'node:assert/strict';import {validPlan} from '../shared/plan.js';
const examples=[
 {label:'Weak but valid',plan:{summary:'Build a keyboard-accessible filter.',steps:[{title:'Do the project',reason:'It is important.'}]},review:'Structurally valid, but too broad to implement or verify. Revise into observable steps.'},
 {label:'More actionable',plan:{summary:'Build and verify a keyboard-accessible filter.',steps:[{title:'Label the filter input',reason:'Give the control a visible associated name.'},{title:'Test filtering with the keyboard',reason:'Confirm the result changes without losing focus.'}]},review:'Actionable and aligned to the goal; still inspect project fit and run the tests.'}
];
console.log('Compare these fictional practice examples; record your own live model observations separately.');
for(const item of examples){assert.ok(validPlan(item.plan));console.log(`${item.label}: contract PASS. Review: ${item.review}`);}
