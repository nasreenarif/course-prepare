import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from './api.js';
import { titleError } from './validation.js';
test('client title rule matches the documented boundaries', () => {
  assert.equal(titleError('   '),'Enter a title.');
  assert.equal(titleError('x'.repeat(200)),'');
  assert.equal(titleError('x'.repeat(201)),'Use 200 characters or fewer.');
});
test('API helper classifies responses and transport failures', async t => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null,{status:204});
    assert.equal(await api('/tasks/1',{method:'DELETE'}),null);
    globalThis.fetch = async () => new Response(JSON.stringify({error:'Enter a title.',code:'VALIDATION_ERROR',fields:{title:'Enter a title.'}}),{status:400,headers:{'Content-Type':'application/json','X-Request-Id':'demo-reference'}});
    await assert.rejects(api('/tasks',{method:'POST',body:{title:''}}), e => e.status===400 && e.fields.title==='Enter a title.' && e.requestId==='demo-reference');
    globalThis.fetch = async () => new Response('<html>Proxy error</html>',{status:502,headers:{'Content-Type':'text/html'}});
    await assert.rejects(api('/tasks'), e=>e.code==='RESPONSE_FORMAT');
    for (const malformed of [null, [], 42, { tasks: null }, { tasks: [{ id: 'x', title: 'x', completed: 'false' }] }]) {
      globalThis.fetch = async () => new Response(JSON.stringify(malformed), { status: 200, headers: { 'Content-Type': 'application/json' } });
      await assert.rejects(api('/tasks'), e => e.code === 'RESPONSE_FORMAT');
    }
    globalThis.fetch = async () => new Response(null, { status: 204 });
    await assert.rejects(api('/tasks'), e => e.code === 'RESPONSE_FORMAT');
    globalThis.fetch = async () => new Response('null', { status: 500, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(api('/tasks'), e => e.code === 'RESPONSE_FORMAT' && e.status === 500);
    globalThis.fetch = async () => { throw new TypeError('network'); };
    await assert.rejects(api('/tasks'), e=>e.code==='NETWORK_ERROR' && e.status===0);
    globalThis.fetch = async (url,{signal}) => new Promise((resolve,reject)=> {
      const fail=()=>reject(new DOMException('aborted','AbortError'));
      if(signal.aborted) fail(); else signal.addEventListener('abort',fail,{once:true});
    });
    await assert.rejects(api('/tasks',{timeoutMs:10}),e=>e.code==='TIMEOUT');
    const controller=new AbortController();controller.abort();
    await assert.rejects(api('/tasks',{signal:controller.signal}),e=>e.code==='CANCELLED');
  } finally { globalThis.fetch=original; }
});
