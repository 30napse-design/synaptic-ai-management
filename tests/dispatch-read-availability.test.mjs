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
