// Run only against the isolated local preview. No production data or invitations.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4173';
const owner='ekramiihamid@gmail.com',worker='qa-worker@sites.test',other='qa-other@sites.test',reviewer='qa-reviewer@sites.test';
async function req(email,payload){const res=await fetch(base+'/api/staff',{method:payload?'POST':'GET',headers:{'oai-authenticated-user-id':'local-test-'+email,'oai-authenticated-user-email':email,'Content-Type':'application/json','Origin':base},...(payload?{body:JSON.stringify(payload)}:{})});return {status:res.status,data:await res.json()}}
assert.equal((await req('stranger@sites.test')).status,403);
for(const [email,role] of [[worker,'employee'],[other,'employee'],[reviewer,'reviewer']])assert.equal((await req(owner,{action:'member',email,name:'فرد آزمایشی',role})).status,200);
const create=await req(owner,{action:'create',kind:'invoice',title:'فاکتور آزمایشی محیط محلی',body:'صرفاً برای آزمون',assignee:worker,reviewer,due:'2026-11-10',priority:'high',ref:'LOCAL-QA',sourceUrl:'https://example.org/document',amount:'1000'});assert.equal(create.status,200);
const id=create.data.id;
let record=(await req(worker)).data.records.find(r=>r.id===id);assert.ok(record);
assert.equal((await req(other)).data.records.some(r=>r.id===id),false);
assert.equal((await req(other,{action:'comment',id,body:'unauthorized'})).status,404);
assert.equal((await req(worker,{action:'update',id,revision:record.revision,status:'review',result:'بررسی شد',checks:['identity']})).status,400);
const checks=['identity','items','amount','terms'];
assert.equal((await req(worker,{action:'update',id,revision:record.revision,status:'review',result:'بررسی شد',checks})).status,200);
assert.equal((await req(worker,{action:'update',id,revision:record.revision,status:'doing',result:'stale',checks})).status,409);
record=(await req(worker)).data.records.find(r=>r.id===id);
assert.equal((await req(worker,{action:'update',id,revision:record.revision,status:'done',result:record.result,checks})).status,400);
assert.equal((await req(reviewer,{action:'update',id,revision:record.revision,status:'done',result:record.result,checks})).status,200);
record=(await req(owner)).data.records.find(r=>r.id===id);assert.equal(record.status,'done');
assert.equal((await req(worker,{action:'update',id,revision:record.revision,status:'todo',result:record.result,checks})).status,403);
assert.equal((await req(owner,{action:'update',id,revision:record.revision,status:'todo',result:record.result,checks})).status,200);
record=(await req(owner)).data.records.find(r=>r.id===id);
assert.equal((await req(owner,{action:'edit',...record,title:'فاکتور اصلاح‌شده محلی'})).status,200);
const final=(await req(owner)).data;record=final.records.find(r=>r.id===id);assert.equal(record.status,'todo');assert.equal(record.result,'');assert.deepEqual(record.checks,[]);assert.ok(final.events.some(e=>e.record_id===id&&e.action==='approve'));
assert.equal((await req(owner,{action:'deactivate',email:worker})).status,200);assert.equal((await req(worker)).status,403);
const legacy=await fetch(base+'/api/command/tariffs-data.js',{headers:{'oai-authenticated-user-id':'local-test-'+other,'oai-authenticated-user-email':other}});assert.equal(legacy.status,403);
console.log('Passed: membership, record isolation, invoice checks, reviewer approval, stale revision, edit reset, audit, deactivation, manager assets. Local only.');
