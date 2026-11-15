import assert from 'node:assert/strict';
// Executed by scripts/test-finance-runtime.mjs in an ephemeral Miniflare D1/R2 only.
const base='https://synapse.test',owner={'oai-authenticated-user-id':'stage1-owner','oai-authenticated-user-email':'ekramiihamid@gmail.com'};
let checks=0;
async function req(path,body,headers=owner){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...headers,Origin:base,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={html:text}}return {status:r.status,data}}
async function expect(path,body,status=200,headers=owner){const r=await req(path,body,headers);assert.equal(r.status,status,path+': '+JSON.stringify(r.data));checks++;return r.data}
async function account(name,permissions){const r=await expect('/api/auth/accounts',{action:'create',username:name,name});await expect('/api/auth/accounts',{action:'permissions',username:name,permissions});const l=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({username:name,password:r.credential.password})});assert.equal(l.status,200);let cookie=l.headers.get('set-cookie').split(';')[0];const changed=await fetch(base+'/api/auth/password',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({currentPassword:r.credential.password,newPassword:'Stage1-Temporary-Test-29!a'})});assert.equal(changed.status,200);cookie=changed.headers.get('set-cookie')?.split(';')[0]||cookie;return {Cookie:cookie}}
const intake=await account('intake',['operations','calls']),other=await account('other',['operations','calls']),billing=await account('billing',['billing_ops']),finance=await account('finance',['finance_ops']),coord=await account('coord',['lab_operations','lab']),scientist=await account('scientist',['results_ops','projects']);
await expect('/api/operations',null,401,{});
const opBody={action:'create',title:'Stage1 private request',subtype:'واریزی‌های مشتریان',sourceBody:'PRIVATE-REQUEST',clientName:'Stage1 researcher',assignee:'staff:billing',due:'2026-12-01'};
const op=(await expect('/api/operations',opBody)).id;
assert.equal((await expect('/api/operations?id='+op,null,200,billing)).selected.id,op);
for(const h of [intake,other,finance,coord]){const r=await expect('/api/operations?id='+op,null,200,h);assert.equal(r.selected,null);assert.equal(r.items.some(x=>x.id===op),false);assert.equal(r.events.length,0);assert.equal(r.sync.length,0)}
await expect('/api/operations',{action:'comment',id:op,body:'unauthorized'},404,other);
const ordinary=(await expect('/api/operations',{...opBody,title:'Own intake',subtype:'ثبت سفارش',assignee:'',clientName:'Unique hidden researcher'},200,intake)).id;
assert.equal((await expect('/api/operations?id='+ordinary,null,200,intake)).selected.id,ordinary);
const hidden=await expect('/api/operations?view=history&contact=unknown&q=Unique',null,200,other);assert.equal(hidden.total,0);assert.equal(hidden.counts.customers,0);
// Assignment scope applies even when category permission is shared.
await expect('/api/operations',{action:'create',title:'Call',subtype:'ثبت سفارش',channel:'phone',assignee:'staff:intake'},200);
assert.equal((await expect('/api/operations?source=incoming',null,200,other)).total,0);
const project=(await expect('/api/staff',{action:'create',kind:'project',title:'CASE-PRIVATE',body:'private',assignee:'staff:scientist',reviewer:'ekramiihamid@gmail.com',priority:'normal'})).id;
assert.equal((await expect('/api/staff',null,200,scientist)).records.some(r=>r.id===project),true);
assert.equal((await expect('/api/staff',null,200,other)).records.some(r=>r.id===project),false);
await expect('/api/staff',{action:'comment',id:project,body:'not mine'},404,other);
const lab=(await expect('/api/laboratories',{action:'lab_save',type:'internal',name:'Stage1 lab',areas:['مولکولی و پروتئینی']})).id;
const portal=await account('portal',['lab_portal']);await db.prepare('INSERT INTO laboratory_members(member_id,laboratory_id,created_at) VALUES(?,?,?)').bind('staff:portal',lab,new Date().toISOString()).run();
await expect('/api/operations',null,403,portal);await expect('/api/operations',{action:'comment',id:ordinary,body:'no'},404,portal);await expect('/api/staff',null,403,portal);
const payload={client:'Stage1 researcher',lines:[{id:'a',description:'PCR',area:'مولکولی و پروتئینی',unit:'نمونه',quantity:2,repeats:2,unit_price:1000},{id:'b',description:'ELISA',area:'مولکولی و پروتئینی',unit:'نمونه',quantity:3,repeats:1,unit_price:2000}],discount:0,tax_bps:0,execution_min:3000};
const inv=(await expect('/api/finance',{action:'document_save',kind:'invoice',payload})).id;
const doc=async id=>(await expect('/api/finance')).documents.find(d=>d.id===id);
for(const status of ['review','approved','issued']){const d=await doc(inv);await expect('/api/finance',{action:'document_status',id:inv,revision:d.revision,status})}
await expect('/api/finance',{action:'link_operation',id:inv,operation_id:op});
await expect('/api/finance',{action:'link_operation',id:inv,operation_id:op}); // idempotent
async function payment(amount,kind='receipt'){return (await expect('/api/finance',{action:'transaction_create',document_id:inv,kind,amount,currency:'IRT',account:'stage1-bank',reference:crypto.randomUUID(),paid_at:'2026-11-14',evidence_url:'https://example.test/proof'})).id}
const verify=async id=>expect('/api/finance',{action:'transaction_verify',id,revision:0,verification_note:'Local test bank proof checked'});
const jobBody={action:'job_save',document_id:inv,line_id:'a',laboratory_id:lab,scientific_contact:'staff:scientist',assignee:'ekramiihamid@gmail.com'};
const createFinance={action:'create_lab_order',id:inv,line_id:'a',laboratory_id:lab,scientific_contact:'staff:scientist'};
const legacy={...jobBody,action:'create',area:'مولکولی و پروتئینی',client:payload.client,service:'PCR',quantity:2,status:'received',notes:'Local test'};
for(const [path,body] of [['/api/finance',createFinance],['/api/laboratories',jobBody],['/api/lab-operations',legacy]])await expect(path,body,409);
await expect('/api/laboratories',jobBody,403,intake);
let current=(await expect('/api/operations?id='+op)).selected;
await db.prepare("UPDATE ops_items SET payment_state='verified' WHERE id=?").bind(op).run();
assert.equal((await expect('/api/operations?id='+op)).selected.paymentState,'pending');
await expect('/api/operations',{...current,action:'update',paymentState:'verified'},409);
const receipt=await payment(2000);await expect('/api/finance',{action:'transaction_verify',id:receipt,revision:0,verification_note:'not authorized'},403,finance);
assert.equal((await expect('/api/operations?id='+op)).selected.paymentState,'pending');
await expect('/api/laboratories',jobBody,409);await verify(receipt);
current=(await expect('/api/operations?id='+op)).selected;assert.equal(current.paymentState,'verified');assert.equal(current.financial.status,'partial');assert.equal(current.financial.paid_rial,20000);assert.equal(current.financial.balance_rial,80000);
for(const [path,body] of [['/api/finance',createFinance],['/api/laboratories',jobBody],['/api/lab-operations',legacy]])await expect(path,body,409);
const second=await payment(1000);await verify(second);
const job=(await expect('/api/finance',createFinance)).id;
await expect('/api/laboratories',jobBody,409);await expect('/api/lab-operations',legacy,409);
// Another service on the same order reuses the order's threshold, never manual paid values.
const jobB=(await expect('/api/lab-operations',{...legacy,line_id:'b'})).id;assert.notEqual(job,jobB);
assert.equal((await db.prepare("SELECT COUNT(*) n FROM finance_links WHERE document_id=? AND type LIKE 'lab-line:%'").bind(inv).first()).n,2);
assert.equal((await doc(inv)).paid_rial,30000);
let j=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();
await expect('/api/laboratories',{action:'job_accept',job_id:job,revision:j.revision,work_version:j.work_version,acceptance:'accepted'},200,portal);
j=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();await expect('/api/laboratories',{action:'progress',job_id:job,revision:j.revision,status:'doing',progress:5},200,portal);
const refund=await payment(1000,'refund');await verify(refund);
j=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();
await expect('/api/laboratories',{action:'progress',job_id:job,revision:j.revision,status:'doing',progress:15},409,portal);
await expect('/api/lab-operations',{...j,action:'update',status:'doing'},409);
await expect('/api/laboratories',{action:'result_create',job_id:job,revision:j.revision,work_version:j.work_version,kind:'raw',title:'Data',url:'https://example.test/data'},409,portal);
await expect('/api/laboratories',{action:'progress',job_id:job,revision:j.revision,status:'paused',progress:5},200,portal);
// Legacy/orphan jobs and fabricated manual receipts never authorize execution.
await db.prepare("INSERT INTO laboratory_jobs(id,reference,area,client,service,quantity,assignee,status,laboratory_id,work_version,price,paid,created_by,created_at,updated_at) VALUES('orphan','LEGACY-ORPHAN',?,?,?,?,?,'received',?,1,100000,100000,?,?,?)").bind('مولکولی و پروتئینی','Manual client','PCR',1,'ekramiihamid@gmail.com',lab,'ekramiihamid@gmail.com',new Date().toISOString(),new Date().toISOString()).run();
await expect('/api/laboratories',{action:'job_accept',job_id:'orphan',revision:0,work_version:1,acceptance:'accepted'},409,portal);
await expect('/api/lab-operations',{...legacy,id:'orphan',action:'update',paid:100000},409);
// Zero minimum is the existing approved credit policy, not an invented full-prepayment requirement.
const credit=(await expect('/api/finance',{action:'document_save',kind:'invoice',payload:{...payload,execution_min:0,lines:payload.lines.map(l=>({...l,description:' '+l.description+' '}))}})).id;
for(const status of ['review','approved','issued']){const d=await doc(credit);await expect('/api/finance',{action:'document_status',id:credit,revision:d.revision,status})}
await expect('/api/laboratories',{...jobBody,document_id:credit,line_id:'a',assignee:'ekramiihamid@gmail.com'},200,coord);
// Concurrent attempts for one service produce exactly one job and one conflict.
const race=await Promise.all([req('/api/laboratories',{...jobBody,document_id:credit,line_id:'b'}),req('/api/lab-operations',{...legacy,document_id:credit,line_id:'b'})]);assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);checks+=2;
assert.equal((await db.prepare("SELECT COUNT(*) n FROM finance_links WHERE document_id=? AND type='lab-line:b'").bind(credit).first()).n,1);
// Unlinked same-name requests and manually marked legacy flags remain unverified.
const unlinked=(await expect('/api/operations',{...opBody,assignee:''})).id;await db.prepare("UPDATE ops_items SET payment_state='verified' WHERE id=?").bind(unlinked).run();assert.equal((await expect('/api/operations?id='+unlinked)).selected.paymentState,'pending');
const lastRefund=await payment(2000,'refund');await verify(lastRefund);assert.equal((await expect('/api/operations?id='+op)).selected.paymentState,'pending');
// Whitespace normalization must not invalidate a correctly created financial line.
const spaced=await db.prepare("SELECT j.* FROM laboratory_jobs j JOIN finance_links l ON l.reference_id=j.id WHERE l.document_id=? AND l.type='lab-line:a'").bind(credit).first();await expect('/api/laboratories',{action:'job_accept',job_id:spaced.id,revision:spaced.revision,work_version:spaced.work_version,acceptance:'accepted'},200,portal);
// A cancelled credit invoice cannot authorize acceptance, even with a zero threshold.
let cd=await doc(credit);await expect('/api/finance',{action:'document_status',id:credit,revision:cd.revision,status:'cancelled',reason:'Local test cancellation'});
const creditJob=await db.prepare("SELECT j.* FROM laboratory_jobs j JOIN finance_links l ON l.reference_id=j.id WHERE l.document_id=? AND l.type='lab-line:a'").bind(credit).first();await expect('/api/laboratories',{action:'job_accept',job_id:creditJob.id,revision:creditJob.revision,work_version:creditJob.work_version,acceptance:'accepted'},409,portal);
// Revoking a role in the isolated fixture removes data access without changing menu behavior.
await db.prepare('UPDATE staff_accounts SET permissions=? WHERE username=?').bind('["people"]','billing').run();await expect('/api/operations',null,403,billing);
console.log('PASS stage1: '+checks+' HTTP checks; scoped lists/details/history/events, financial truth, partial payments, multi-service, legacy bypass, refund revocation and credit policy. Ephemeral DB only.');
