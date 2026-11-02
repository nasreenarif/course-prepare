import assert from 'node:assert/strict';
import { makeAIService } from '../server/ai.js';
import { validPlan } from '../shared/plan.js';
import { providerCases } from './provider-fixtures.mjs';
console.log('LOCAL FIXTURES ONLY: fetch is injected; no key, network, or paid request.');
for (const item of providerCases) {
 let observed;
 try {
  const service=makeAIService({mode:'live',key:'not-a-real-key',model:'gemini-fixture'},{fetchImpl:item.fetchImpl});
  const plan=await service.generate('Build a practice checklist');
  observed=validPlan(plan)?'PLAN':'INVALID_PLAN';
 } catch(error) {observed=error.code||error.name;}
 assert.equal(observed,item.expected,item.name);
 console.log(`${item.name}: ${observed} (expected ${item.expected})`);
}
