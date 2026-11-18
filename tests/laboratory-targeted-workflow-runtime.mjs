import assert from 'node:assert/strict';
const base='https://synapse.test',OWNER='ekramiihamid@gmail.com',owner={'oai-authenticated-user-id':'center-test','oai-authenticated-user-email':OWNER};let checks=0,seq=0;
async function api(path,b,h=owner,status=200){const r=await fetch(base+path,{method:b?'POST':'GET',headers:{...h,Origin:base,'Content-Type':'application/json'},...(b?{body:JSON.stringify(b)}:{})});const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={text}}assert.equal(r.status,status,JSON.stringify(d).slice(0,700));checks++;return d}
for(const [role,username]of [['customer_manager','customer'],['finance_manager','finance'],['research_specialist','specialist'],['research_manager','research'],['executive_director','executive']]){const p=await db.prepare('SELECT * FROM workflow_positions WHERE code=?').bind(role).first();await db.prepare('INSERT INTO staff_members(email,name) VALUES(?,?)').bind('staff:'+username,'Synthetic '+username).run();await db.prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,org_roles,org_mode,updated_at) VALUES(?,?,'synthetic','synthetic',0,?,?,'managed','then')").bind(username,'staff:'+username,JSON.stringify(JSON.parse(p.role_definition).permissions),JSON.stringify([role])).run();await db.prepare('INSERT INTO workflow_position_assignments(id,position_id,primary_member_id,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind('center-'+username,p.id,'staff:'+username,OWNER,'then','then').run()}
async function session(username,c){const token=c.repeat(64),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');await db.prepare('INSERT INTO staff_sessions(token_hash,username,expires_at) VALUES(?,?,?)').bind(hash,username,Date.now()+3600000).run();return {Cookie:'__Host-synapse_staff='+token}}
const customer=await session('customer','a'),finance=await session('finance','b'),specialist=await session('specialist','c'),executive=await session('executive','d');
const labA=(await api('/api/laboratories',{action:'lab_save',type:'internal',name:'Synthetic histology',areas:['بافت‌شناسی و پاتولوژی']})).id,labB=(await api('/api/laboratories',{action:'lab_save',type:'external',name:'Synthetic molecular',areas:['مولکولی و پروتئینی']})).id;
for(const [username,lid]of [['provider.a',labA],['provider.b',labB]]){await db.prepare('INSERT INTO staff_members(email,name) VALUES(?,?)').bind('staff:'+username,username).run();await db.prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,org_roles,org_mode,updated_at) VALUES(?,?,'synthetic','synthetic',0,'[\"lab_portal\"]','[]','managed','now')").bind(username,'staff:'+username).run();await db.prepare('INSERT INTO laboratory_members(member_id,laboratory_id,created_at) VALUES(?,?,?)').bind('staff:'+username,lid,'now').run();}
const providerA=await session('provider.a','e'),providerB=await session('provider.b','f');

const assignments=[{domain:'histology',laboratory_id:labA,services:[{description:'Synthetic targeted tissue',quantity:3,unit:'قطعه'}]}];
const id=(await api('/api/laboratory-center',{action:'case_create',key:'targeted-case',invoice_number:'TEST-TARGET-583',customer_name:'Synthetic targeted researcher',title:'Synthetic targeted project',assignments},customer)).id;
const ja=(await api('/api/laboratory-center',{action:'case_approve',id,key:'targeted-approve'})).jobs[0];
const read=async(h=providerA)=>api('/api/laboratory-center',null,h);
let d=await read(),j=d.jobs.find(j=>j.id===ja);assert.ok(j.readiness.accept_blockers.some(x=>x.includes('مجوز')));assert.equal(j.acceptance,'pending');
let row=await db.prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(ja).first();
await api('/api/laboratories',{action:'job_accept',job_id:ja,revision:row.revision,work_version:row.work_version,acceptance:'accepted'},providerA,409);
assert.equal((await db.prepare('SELECT acceptance FROM laboratory_jobs WHERE id=?').bind(ja).first()).acceptance,'pending');
assert.equal((await api('/api/sample-intake?id='+id,null,customer)).selected.id,id);
const html=await (await fetch(base+'/laboratories',{headers:customer})).text();assert.ok(html.includes('پرونده‌های آزمایشگاهی'));
async function intake(action,b={}){const p=(await api('/api/sample-intake?id='+id,null,customer)).selected;return api('/api/sample-intake',{action,id,revision:p.revision,key:'targeted-intake-'+(++seq),...b},customer);}
let p=(await api('/api/sample-intake?id='+id,null,customer)).selected;const item=(await intake('intake_item',{category:'بافت و پاتولوژی',sample_type:'بافت نرم',name:'Synthetic targeted tissue',quantity:3,amount_per_unit:'1',unit:'قطعه',supplier:'مشتری',preparation:'فیکس‌شده',transport:'Synthetic approved conditions',destination:'آزمایشگاه بافت‌شناسی',order_line_id:p.order_lines[0].id})).id;
const shipment=(await intake('intake_shipment',{method:'شرکت حمل یا پیک مجاز',packages:1,lines:[{item_id:item,quantity:3}]})).id;
let clock=Date.now()-50000;const hand=()=>({at:new Date(clock+=1000).toISOString(),from:'Synthetic sender',to:'Synthetic receiver',condition:'Synthetic intact package'});
await intake('intake_receive',{shipment_id:shipment,lines:[{item_id:item,quantity:2}],...hand()});
await intake('intake_review',{shipment_id:shipment,item_id:item,decision:'پذیرش بخشی از اقلام',accepted:1,issue:'مشکل کیفیت یا بسته‌بندی',notes:'Synthetic partial acceptance'});
await intake('intake_receive',{shipment_id:shipment,lines:[{item_id:item,quantity:1}],...hand()});
await intake('intake_review',{shipment_id:shipment,item_id:item,decision:'رد نمونه',accepted:0,issue:'عدم انطباق با سفارش',notes:'Synthetic rejection'});
p=(await api('/api/sample-intake?id='+id,null,customer)).selected;assert.equal(p.inventory[0].stock.institute,1);assert.equal(p.inventory[0].stock.quarantine,2);assert.equal(p.inventory[0].intake.review_history.length,2);
async function upload(path,fields,file,h=owner){const fd=new FormData();for(const [k,v] of Object.entries(fields))fd.set(k,String(v));fd.set('file',file);const req=new Request(base+path,{method:'POST',body:fd});const r=await fetch(base+path,{method:'POST',headers:{...h,Origin:base,'Content-Type':req.headers.get('content-type')},body:await req.arrayBuffer()});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));checks++;return d;}
await upload('/api/lab-operations',{id,revision:p.revision,kind:'receipt',amount:'100',description:'Synthetic attributable receipt'},new File(['%PDF-1.4 synthetic'],'receipt.pdf',{type:'application/pdf'}));
d=await read();j=d.jobs.find(j=>j.id===ja);assert.equal(j.readiness.accept_blockers.length,0);
await api('/api/laboratories',{action:'job_accept',job_id:ja,revision:j.revision,work_version:j.work_version,acceptance:'accepted'},providerA);
d=await read();j=d.jobs.find(j=>j.id===ja);assert.equal(j.readiness.accepted_current,true);assert.equal(j.accepted_by,'staff:provider.a');assert.equal(j.assignee,'staff:specialist');assert.ok(j.readiness.submit_blockers.some(x=>x.includes('نمونه')));
let dataset={title:'Synthetic targeted dataset',sample_ids:[item],sample_count:1,assets:[]};
async function save(state,key='target-save-'+(++seq)){const j=(await read()).jobs.find(j=>j.id===ja);return api('/api/laboratory-center',{action:'dataset_save',key,job_id:ja,job_revision:j.revision,work_version:j.work_version,state,dataset},providerA);}
const draft=await save('draft');await api('/api/laboratory-center',{action:'dataset_submit',key:'bad-draft-submit',job_id:ja,draft_id:draft.id},providerA,409);
const incomplete=await save('ready');await api('/api/laboratory-center',{action:'dataset_submit',key:'bad-incomplete-submit',job_id:ja,draft_id:incomplete.id},providerA,400);
const report=await upload('/api/laboratories/files',{job_id:ja},new File(['%PDF-1.4 synthetic report'],'report.pdf',{type:'application/pdf'}),providerA);
dataset={...dataset,report_title:'Synthetic report',report_method:'Synthetic documented method',report_findings:'Synthetic findings',technical_signatory:'Synthetic signatory',assets:[{id:report.id,section:'report',description:'Synthetic report'}]};
const complete=await save('ready');await api('/api/laboratory-center',{action:'dataset_submit',key:'custody-block',job_id:ja,draft_id:complete.id},providerA,409);
p=(await api('/api/sample-intake?id='+id,null,customer)).selected;
await api('/api/laboratory-center',{action:'sample_move',key:'target-send',id,revision:p.revision,item_id:item,stage:'send',location:'institute',destination:labA,quantity:1,...hand()});
p=(await api('/api/lab-operations?view=mother&id='+id)).selected;
await api('/api/laboratory-center',{action:'sample_move',key:'target-receive',id,revision:p.revision,item_id:item,stage:'receive',location:labA,quantity:1,...hand()},providerA);
d=await read();assert.equal(d.jobs.find(j=>j.id===ja).readiness.submit_blockers.length,0);
const submit={action:'dataset_submit',key:'target-submit',job_id:ja,draft_id:complete.id};await api('/api/laboratory-center',submit,providerA);assert.equal((await api('/api/laboratory-center',submit,providerA)).replayed,true);
const persisted=await read();assert.equal(persisted.records.filter(r=>r.job_id===ja&&r.kind==='result').length,1);assert.equal((await db.prepare('SELECT COUNT(*) n FROM finance_transactions').first()).n,0);
assert.equal(persisted.services.filter(s=>s.tariff_id.startsWith('EL:')).length,58);assert.ok(persisted.services.filter(s=>s.tariff_id.startsWith('EL:')).every(s=>s.domain==='protein-biochemistry'&&s.method!=='در مرجع فعلی ثبت نشده'));
assert.ok(!JSON.stringify(persisted).includes('unitPriceToman'));
await api('/api/sample-intake?id='+id,null,providerA,403);
console.log('Targeted laboratory workflow: '+checks+' isolated HTTP checks passed; partial/rejected intake, actor/version/permit gates, draft and documented result send/replay; no production writes.');
