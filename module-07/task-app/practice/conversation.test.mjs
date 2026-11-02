import test from 'node:test';import assert from 'node:assert/strict';import {boundedHistory} from './conversation.mjs';
test('conversation preserves a bounded user/assistant exchange ending in user',()=>{
 assert.deepEqual(boundedHistory([{role:'user',content:' hi '}]),[{role:'user',content:'hi'}]);
 assert.equal(boundedHistory([{role:'user',content:'a'},{role:'assistant',content:'b'},{role:'user',content:'c'}]).length,3);
});
test('conversation rejects privileged roles, extra fields, missing final user, and excess content',()=>{
 for(const input of [[],[{role:'system',content:'x'}],[{role:'user',content:'x',tools:[]}],[{role:'user',content:'a'},{role:'assistant',content:'b'}],Array.from({length:5},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(1000)}))])assert.throws(()=>boundedHistory(input));
});
