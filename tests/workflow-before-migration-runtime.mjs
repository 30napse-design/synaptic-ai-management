import assert from 'node:assert/strict';
const origin='https://synapse.test',headers={'oai-authenticated-user-id':'synthetic-owner','oai-authenticated-user-email':'ekramiihamid@gmail.com',Origin:origin,'Content-Type':'application/json'};
for(const view of ['orders','researchers','positions']){const r=await fetch(origin+'/api/operations?view='+view,{headers});assert.equal(r.status,503,await r.text())}
assert.equal((await fetch(origin+'/api/operations',{headers})).status,200);
assert.equal((await fetch(origin+'/api/finance',{headers})).status,200);
const r=await fetch(origin+'/api/operations',{method:'POST',headers,body:JSON.stringify({action:'researcher_save',name:'Synthetic',create_key:'missing-migration'})});assert.equal(r.status,503,await r.text());
assert.equal((await db.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name='research_people'").first()).n,0);
console.log('PASS before migration: new views return 503, existing operations/finance remain available, no automatic schema creation.');
