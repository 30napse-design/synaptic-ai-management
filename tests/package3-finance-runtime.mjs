import assert from 'node:assert/strict';
// Executed ONLY by the existing isolated Miniflare D1/R2 runner, never against Sites.
const base='https://synapse.test',owner={'oai-authenticated-user-id':'package3-fixture-owner','oai-authenticated-user-email':'ekramiihamid@gmail.com'},stamp=new Date().toISOString(),prefix='SYNAPSE-P3-SYNTHETIC-'+crypto.randomUUID();let checks=0;const scenarios=[];
async function call(path,body,h=owner,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...h,Origin:base,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={html:text}}assert.equal(r.status,status,path+': '+JSON.stringify(d).slice(0,400));checks++;return {r,d};}
const fin=async(body,h=owner,status=200)=>(await call('/api/finance',body,h,status)).d;
const document=async id=>(await fin()).documents.find(d=>d.id===id);
const change=async(id,status,h=owner,extra={})=>fin({action:'document_status',id,revision:(await document(id)).revision,status,...extra},h);
// Synthetic sessions use the real local login, password hash and approved role machinery.
const roles={scientific:['scientific_manager','staff:mazaheri'],finance:['finance_manager','staff:finance'],specialist:['research_specialist','staff:specialist']},users={};
for(const [username,[role,member]] of Object.entries(roles)){
 const position=await db.prepare('SELECT * FROM workflow_positions WHERE code=?').bind(role).first();assert.ok(position);const permissions=JSON.parse(position.role_definition).permissions;
 const salt=crypto.randomUUID(),password='Synthetic-only-Package3-26!',key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password+'\0local-test-pepper'),'PBKDF2',false,['deriveBits']),hash=Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256)),b=>b.toString(16).padStart(2,'0')).join('');
 await db.prepare("INSERT INTO staff_members(email,name,role,active) VALUES(?,?,'employee',1)").bind(member,'Synthetic '+username).run();
 await db.prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at,org_roles,org_proposed_roles,org_mode) VALUES(?,?,?,?,0,?,?,?,?,'managed')").bind(username,member,hash,salt,JSON.stringify(permissions),stamp,JSON.stringify([role]),JSON.stringify([role])).run();
 await db.prepare("INSERT INTO workflow_position_assignments(id,position_id,scope_type,scope_id,primary_member_id,created_by,created_at,updated_at) VALUES(?,?,'institute','',?,?,?,?)").bind('p3-'+username,position.id,member,'ekramiihamid@gmail.com',stamp,stamp).run();
 const login=await call('/api/auth/login',{username,password},{},200);users[username]={Cookie:login.r.headers.get('set-cookie').split(';')[0]};
}
await fin(undefined,{},403);await fin(undefined,users.specialist,403);
const rates=(await fin(undefined,users.scientific)).tariffServices;assert.ok(rates.length>=2);const selected=[rates[0],rates.find(r=>r.area!==rates[0].area)||rates[1]];
const lines=selected.map((r,i)=>({id:'service-'+i,description:r.description,area:r.area,unit:r.unit,quantity:2,repeats:1,unit_price:r.unitPriceToman,cost_total:0,tariff_id:r.tariff_id,tariff_version:r.version}));
const payload={client:prefix,contact:'fixture@example.invalid',reference:prefix,lines,discount:0,tax_bps:0,execution_min:0,installments:[],due:'2026-12-01',scope:'Synthetic scientific design and multi-service selection'};
await fin({action:'document_save',kind:'quote',payload:{...payload,lines:[{...lines[0],unit_price:1}]}},users.scientific,400);
await fin({action:'document_save',kind:'quote',payload:{...payload,lines:[{...lines[0],tariff_id:'unapproved:test'}]}},users.scientific,400);
const q=(await fin({action:'document_save',kind:'quote',payload},users.scientific)).id;
await change(q,'review',users.scientific);await fin({action:'document_status',id:q,revision:(await document(q)).revision,status:'approved'},users.scientific,403);
scenarios.push('approved bank selection and scientific/financial separation');
// Keep all existing central identifiers and route through the existing Finance Manager appointment.
const person=(await call('/api/operations',{action:'researcher_save',create_key:prefix,name:prefix,email:'fixture@example.invalid'})).d.id;
const order=(await call('/api/operations',{action:'order_save',create_key:prefix,researcher_id:person,title:prefix,current_position_id:'finance_manager',next_action:'Synthetic financial approval',follow_up_date:'2026-12-01'})).d.id;
await call('/api/operations',{action:'order_link',order_id:order,revision:0,target_type:'finance_document',target_id:q,reason:'Synthetic authoritative invoice association'});
const request=(await call('/api/operations',{action:'dispatch_create',sourceKey:prefix,title:prefix+' payment',sourceBody:'Synthetic invoice and bank request',family:'A04',orderId:order,clientName:prefix,email:'fixture@example.invalid',synthetic:true})).d.id;
assert.equal((await db.prepare("SELECT COUNT(*) n FROM staff_records r JOIN staff_work_details w ON w.record_id=r.id WHERE json_extract(w.details,'$.dispatchRequest')=? AND r.assignee='staff:finance'").bind(request).first()).n,1);
const total=lines.reduce((n,l)=>n+l.quantity*l.repeats*l.unit_price,0),deposit=Math.floor(total/3),remainder=total-deposit;
let current=await document(q);await fin({action:'document_save',id:q,revision:current.revision,kind:'quote',payload:{...current.payload,execution_min:deposit,installments:[{title:'Synthetic deposit',amount:deposit,due:'2026-11-16'},{title:'Synthetic stage 2',amount:remainder,due:'2026-12-01'}],payment_terms:'Synthetic approved deposit then stage 2'}},users.finance);
await change(q,'review',users.finance);await change(q,'approved',users.finance);
await fin({action:'document_status',id:q,revision:(await document(q)).revision,status:'sent',evidence_note:'No actual proof'},users.finance,400);
async function evidence(target,context,label){const form=new FormData();form.set('context',context);form.set('target_id',target);form.set('title',prefix+' '+label);form.set('file',new Blob(['SYNTHETIC ONLY,isolated test proof\n'+target+','+label],{type:'text/csv'}),label+'.csv');const encoded=new Response(form);const r=await fetch(base+'/api/finance/files',{method:'POST',headers:{...users.finance,Origin:base,'Content-Type':encoded.headers.get('content-type')},body:await encoded.arrayBuffer()});assert.equal(r.status,200,await r.clone().text());const f=await r.json(),url=base+'/api/finance/files?id='+f.id;const read=await fetch(url,{headers:users.finance});assert.equal(read.status,200);assert.ok((await read.text()).includes('SYNTHETIC ONLY'));checks+=2;return url;}
const proof=await evidence(q,'quote','test-mailbox-receipt');
const send={action:'document_delivery',id:q,revision:(await document(q)).revision,version:(await document(q)).version,channel:'other',recipient:'Isolated synthetic test mailbox',message_id:prefix+'-quote',sent_at:stamp,evidence_url:proof,evidence_note:'Synthetic only: receipt of document in isolated test mailbox; no external email',external_send_confirmed:'yes'};
await fin({...send,evidence_url:''},users.finance,400);await fin({...send,version:0},users.finance,409);await fin(send,users.finance);assert.equal((await fin(send,users.finance)).replayed,true);
await change(q,'accepted',users.finance,{evidence_note:'Synthetic client approval record only',evidence_url:proof});
const conversions=await Promise.all([1,2].map(()=>fetch(base+'/api/finance',{method:'POST',headers:{...users.finance,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'document_convert',id:q})})));assert.deepEqual(conversions.map(r=>r.status).sort(),[200,409]);checks+=2;const inv=(await conversions.find(r=>r.status===200).json()).id;await change(inv,'review',users.finance);await change(inv,'approved',users.finance);await change(inv,'issued',users.finance);
const invoiceProof=await evidence(inv,'invoice','issued-invoice-delivery');await fin({...send,id:inv,revision:(await document(inv)).revision,version:1,message_id:prefix+'-invoice',evidence_url:invoiceProof},users.finance);assert.equal((await document(inv)).status,'issued');
await fin({action:'document_convert',id:q},users.finance,409);
scenarios.push('versioned multi-service quotation, client evidence, issue, documented delivery and replay protection');
// The existing safe correction path retains old invoice, versions and reversing journal.
const amended=(await fin({action:'invoice_amend',id:inv,revision:(await document(inv)).revision,reason:'Synthetic corrected payment wording'},users.finance)).id;
assert.equal((await document(inv)).status,'cancelled');assert.equal((await document(amended)).source_id,inv);
await fin({action:'document_save',id:inv,revision:(await document(inv)).revision,kind:'invoice',payload},users.finance,400);
await fin({action:'document_convert',id:q},users.finance,409);
current=await document(amended);await fin({action:'document_save',id:amended,revision:current.revision,source_id:current.source_id,kind:'invoice',payload:{...current.payload,payment_terms:'Synthetic corrected terms; same commercial totals'}},users.finance);
await change(amended,'review',users.finance);await change(amended,'approved',users.finance);await change(amended,'issued',users.finance);
await fin({...send,id:amended,revision:(await document(amended)).revision,version:(await document(amended)).version,message_id:prefix+'-amended',evidence_url:await evidence(amended,'invoice','amended-invoice-delivery')},users.finance);
await fin({action:'link_operation',id:amended,operation_id:request},users.finance);
scenarios.push('atomic invoice correction, original preservation and no duplicate invoice from original quote');
const lab=(await call('/api/laboratories',{action:'lab_save',type:'internal',name:prefix,areas:[lines[0].area]})).d.id;
const issueJob=()=>({action:'create_lab_order',id:amended,line_id:lines[0].id,laboratory_id:lab,assignee:'staff:specialist',scientific_contact:'staff:mazaheri',instructions:'SYNTHETIC ONLY service execution instructions'});
await fin(issueJob(),owner,409);
async function receipt(amount,doc=amended,label='receipt'){return (await fin({action:'transaction_create',kind:'receipt',amount,currency:'IRT',document_id:doc,account:prefix,reference:prefix+'-'+crypto.randomUUID(),paid_at:'2026-11-16',description:'SYNTHETIC ONLY '+label,evidence_url:invoiceProof},users.finance)).id;}
async function bankRow(amount,label){await fin({action:'bank_import',account:prefix,rows:[{date:'2026-11-16',reference:prefix+'-'+label,description:'SYNTHETIC ONLY '+label,amount_rial:amount*10}]},users.finance);return (await fin()).bank.find(r=>r.reference===prefix+'-'+label).id;}
const pre=await receipt(deposit-1,q,'advance to quotation');await fin(issueJob(),owner,409);
const wrong=await bankRow(deposit,'wrong-amount');await fin({action:'transaction_verify',id:pre,revision:0,bank_row_id:wrong,verification_note:'Synthetic mismatch'},users.finance,400);
await fin({action:'transaction_verify',id:pre,revision:0,verification_note:'No evidence'},users.scientific,403);
const correct=await bankRow(deposit-1,'advance');await fin({action:'transaction_verify',id:pre,revision:0,bank_row_id:correct,verification_note:'Synthetic matched bank row'},users.finance);
await fin({action:'receipt_allocate',id:pre,revision:1,document_id:amended},users.finance);await fin(issueJob(),owner,409);
const one=await receipt(1),oneRow=await bankRow(1,'advance-topup');await fin({action:'transaction_verify',id:one,revision:0,bank_row_id:oneRow,verification_note:'Synthetic exact minimum reached'},users.finance);
assert.equal((await call('/api/finance?view=execution',undefined,users.specialist)).d.documents.some(d=>d.id===amended),true);
const job=(await fin(issueJob(),owner)).id;assert.ok(job);await fin(issueJob(),owner,409);
let executable=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();await call('/api/laboratories',{action:'job_accept',job_id:job,revision:executable.revision,work_version:executable.work_version,acceptance:'accepted'},users.specialist);executable=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();await call('/api/laboratories',{action:'progress',job_id:job,revision:executable.revision,status:'doing',progress:1,progress_notes:'SYNTHETIC ONLY: permitted start after approved financial minimum'},users.specialist);
await fin({action:'invoice_amend',id:amended,revision:(await document(amended)).revision,reason:'Must not cancel confirmed receipts'},users.finance,400);
const last=await receipt(remainder),lastRow=await bankRow(remainder,'stage-2');await fin({action:'transaction_verify',id:last,revision:0,bank_row_id:lastRow,verification_note:'Synthetic stage 2 exact reconciliation'},users.finance);
assert.equal((await document(amended)).balance_rial,0);
const extra=await receipt(1);await fin({action:'transaction_verify',id:extra,revision:0,bank_row_id:oneRow,verification_note:'Duplicate bank row'},users.finance,400);
await fin({action:'transaction_verify',id:extra,revision:0,verification_note:'Synthetic overpayment with document proof'},users.finance,409);
scenarios.push('advance allocation, staged payments, mismatch rejection, unpaid/partial execution blocking and exact-minimum permit');
// Refund below the approved minimum revokes the same job's financial permit.
const refund=(await fin({action:'transaction_create',kind:'refund',amount:total-deposit+1,currency:'IRT',document_id:amended,account:prefix,reference:prefix+'-refund',paid_at:'2026-11-16',evidence_url:invoiceProof,description:'SYNTHETIC ONLY refund'},users.finance)).id;
const refundRow=await bankRow(-(total-deposit+1),'refund');await fin({action:'transaction_verify',id:refund,revision:0,bank_row_id:refundRow,verification_note:'Synthetic refund reverses execution eligibility'},users.finance);
const jobBefore=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(job).first();
await call('/api/laboratories',{action:'progress',job_id:job,revision:jobBefore.revision,status:'doing',progress:10,progress_notes:'Should be blocked'},users.specialist,409);
scenarios.push('settlement, duplicate/overpayment prevention and revocation after refund');
const rows=(await fin()).journal;for(const j of rows)assert.equal(j.lines.reduce((n,l)=>n+(l.debit||0)-(l.credit||0),0),0);
const graph=(await call('/api/operations?view=orders&id='+order)).d;assert.ok(JSON.stringify(graph).includes(amended));assert.ok(JSON.stringify(graph).includes(person));
const printed=(await call('/finance-print/'+amended)).d.html;assert.ok(printed.includes(prefix));assert.ok(!printed.includes('cost_total'));
scenarios.push('central researcher/order/financial/laboratory linkage, balanced ledger and customer print');
console.log(JSON.stringify({ok:true,checks,scenarios,scope:'isolated compiled HTTP API + temporary D1/R2; no real bank, customer data or external sending'}));
