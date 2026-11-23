import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=x=>readFileSync(x,'utf8');
const engine=read('lib/dispatch-engine.ts');
const app=read('app/(workspace)/operations/page.tsx');
const route=read('app/api/operations/route.ts');
test('dispatch read survives optional background job exceptions',()=>{
 assert.match(engine,/const jobs=\[/);
 for(const name of ['laboratory-ingestion','intake-ingestion','task-reconciliation','overdue-sweep'])assert.ok(engine.includes(name));
 assert.match(engine,/for\(const \[job,run\] of jobs\)/);
 assert.match(engine,/try\{await run\(\)\}catch/);
 assert.match(engine,/console\.error\('Dispatch housekeeping failed:'/);
});
test('core authentication, migration and authorization are not bypassed',()=>{
 assert.match(engine,/allowActor\(u\);must\(await dispatchReady\(\)/);
 assert.match(route,/if\(!u\)return json\(\{error:'ابتدا وارد شوید'\},401\)/);
 assert.match(app,/await workspaceUser\(\)/);
 assert.doesNotMatch(engine,/catch\{return \{user:/);
});
test('read behavior retains actual records and id-scoped authorization',()=>{
 assert.match(engine,/const r=await authorized\(u,id\)/);
 assert.match(engine,/if\(!mayReadRequest\(u,r\)\)continue/);
 assert.match(engine,/SELECT \* FROM ops_items WHERE request_state!=''/);
});

test('dispatch page read does not synchronously run maintenance jobs by default',()=>{
 assert.match(engine,/readDispatch\(u:any,p:URLSearchParams,housekeeping=false\)/);
 assert.match(engine,/if\(housekeeping\)\{/);
});
test('operations page tolerates optional reporting failures without bypassing record authorization',()=>{
 const data=read('lib/operations-data.ts');
 assert.match(data,/statements\.slice\(0,2\)/);
 assert.match(data,/operations optional read failed/);
 assert.match(data,/unassignedSQL=routingReady/);
 assert.match(data,/assignmentStateSQL=routingReady/);
 assert.match(data,/rr\[0\]\.results\.filter\(r=>canSeeOps\(u,r\)\)/);
 assert.match(app,/catch\(e:any\).*OperationsApp initialData=\{null\}/);
 assert.match(route,/operations API read failed/);
});
