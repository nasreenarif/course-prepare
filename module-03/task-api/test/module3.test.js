import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../app.js';
import Task from '../models/Task.js';
import { validateTaskInput, validateListQuery } from '../validation/taskInput.js';

test('body validation handles shape, allowlist, normalization and partial updates', () => {
  for (const body of [undefined, null, [], 4, {}, {title:'x'}, {title:42}, {title:'   '}, {title:'Valid', ownerId:'x'}, {title:'Valid',completed:'false'}]) {
    assert.ok(validateTaskInput(body).error);
  }
  assert.deepEqual(validateTaskInput({title:'  Study API  '}), {value:{title:'Study API'}});
  assert.deepEqual(validateTaskInput({completed:false},{partial:true}), {value:{completed:false}});
  assert.ok(validateTaskInput({}, {partial:true}).error);
  assert.deepEqual(validateTaskInput({description:''},{partial:true}), {value:{description:''}});
});
test('query validation rejects unbounded, repeated, and unsupported inputs', () => {
  assert.deepEqual(validateListQuery({}), {value:{filter:{},page:1,limit:10}});
  assert.deepEqual(validateListQuery({completed:'false',page:'2',limit:'5'}), {value:{filter:{completed:false},page:2,limit:5}});
  for (const query of [{limit:'0'},{limit:'51'},{page:'1.5'},{page:'10001'},{page:['1','2']},{completed:'maybe'},{sort:'title'}]) assert.ok(validateListQuery(query).error);
});
test('real Mongoose model validates without persistence', async () => {
  const task = new Task({title:'  Read Module 3  '});
  await task.validate();
  assert.equal(task.title,'Read Module 3');
  assert.equal(task.completed,false);
  assert.equal(task.priority,'normal');
  await assert.rejects(new Task({title:'R'}).validate(), {name:'ValidationError'});
  await assert.rejects(new Task({title:'Valid',priority:'urgent'}).validate(), {name:'ValidationError'});
});
test('HTTP contract with controlled model stubs (not live MongoDB)', async t => {
  const methods=['create','find','findById','findByIdAndDelete'];
  const originals=Object.fromEntries(methods.map(name=>[name,Task[name]]));
  const records=new Map();
  let counter=1;
  Task.create=async value=>{
    const id=(counter++).toString(16).padStart(24,'0');
    const record={_id:id,description:'',completed:false,priority:'normal',...value,createdAt:new Date(),updatedAt:new Date(),async save(){this.updatedAt=new Date();return this;}};
    records.set(id,record);return record;
  };
  Task.findById=async id=>records.get(id)??null;
  Task.findByIdAndDelete=async id=>{const record=records.get(id)??null;records.delete(id);return record;};
  Task.find=filter=>{let offset=0;return {sort(){return this;},skip(n){offset=n;return this;},async limit(n){return [...records.values()].filter(r=>filter.completed===undefined||r.completed===filter.completed).slice(offset,offset+n);}};};
  const server=app.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(path,options={})=>fetch(base+path,options);
  const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  try {
    await t.test('health and route-not-found',async()=>{
      assert.equal((await request('/api/health')).status,200);
      assert.equal((await request('/missing')).status,404);
    });
    let id;
    await t.test('creation and public fields',async()=>{
      const r=await request('/api/tasks',json('POST',{title:'Read module'}));
      assert.equal(r.status,201);const body=await r.json();id=body.id;
      assert.equal(r.headers.get('location'),`/api/tasks/${id}`);
      assert.equal(body.completed,false);assert.ok(body.createdAt);assert.equal(body._id,undefined);
    });
    await t.test('list envelope and bounded query',async()=>{
      const r=await request('/api/tasks?completed=false&page=1&limit=5');
      assert.equal(r.status,200);const body=await r.json();assert.equal(body.items.length,1);assert.equal(body.limit,5);
      assert.equal((await request('/api/tasks?limit=0')).status,400);
    });
    await t.test('detail and partial update preserve omitted fields',async()=>{
      assert.equal((await request(`/api/tasks/${id}`)).status,200);
      const r=await request(`/api/tasks/${id}`,json('PATCH',{completed:true}));
      assert.equal(r.status,200);const body=await r.json();assert.equal(body.completed,true);assert.equal(body.title,'Read module');
    });
    await t.test('input, format and presence failures are distinct',async()=>{
      assert.equal((await request('/api/tasks',json('POST',{title:'R'}))).status,400);
      assert.equal((await request(`/api/tasks/${id}`,json('PATCH',{}))).status,400);
      assert.equal((await request('/api/tasks/bad-id')).status,400);
      assert.equal((await request('/api/tasks/ffffffffffffffffffffffff')).status,404);
    });
    await t.test('parser and content-type failures',async()=>{
      assert.equal((await request('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"title":'})).status,400);
      assert.equal((await request('/api/tasks',{method:'POST',headers:{'Content-Type':'text/plain'},body:'hello'})).status,415);
      assert.equal((await request('/api/tasks',json('POST',{title:'x'.repeat(18000)}))).status,413);
    });
    await t.test('deletion has no body and later detail is absent',async()=>{
      const r=await request(`/api/tasks/${id}`,{method:'DELETE'});assert.equal(r.status,204);assert.equal(await r.text(),'');
      assert.equal((await request(`/api/tasks/${id}`)).status,404);
    });
    await t.test('unexpected model failure returns safe 500',async()=>{
      const previous=Task.findById;
      Task.findById=async()=>{throw new Error('INTERNAL TEST VALUE');};
      const r=await request('/api/tasks/ffffffffffffffffffffffff');
      assert.equal(r.status,500);assert.deepEqual(await r.json(),{message:'Unable to complete the request.'});
      Task.findById=previous;
    });
  } finally {
    for(const name of methods) Task[name]=originals[name];
    await new Promise(resolve=>server.close(resolve));
  }
});
