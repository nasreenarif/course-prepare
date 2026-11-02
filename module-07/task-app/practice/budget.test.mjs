import test from 'node:test';import assert from 'node:assert/strict';import {estimateTextCost} from './budget.mjs';
const base={inputTokens:800,outputTokens:300,inputPerMillion:2,outputPerMillion:8,requests:100};
test('budget arithmetic handles hypothetical rates, zero usage and aggregation',()=>{
 const result=estimateTextCost(base);assert.ok(Math.abs(result.perRequest-.004)<1e-12);assert.ok(Math.abs(result.total-.4)<1e-12);
 assert.equal(estimateTextCost({...base,requests:0}).total,0);
 assert.equal(estimateTextCost({...base,inputTokens:0,outputTokens:0}).total,0);
});
test('budget rejects invalid inputs instead of silently estimating nonsense',()=>{
 for(const value of [-1,NaN,Infinity,'800',1.5])assert.throws(()=>estimateTextCost({...base,inputTokens:value}));
 assert.throws(()=>estimateTextCost({...base,outputPerMillion:-1}));
});
