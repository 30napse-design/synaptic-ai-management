import assert from 'node:assert/strict';
const owner='ekramiihamid@gmail.com',a='qa-a@sites.test',b='qa-b@sites.test',reviewer='qa-review@sites.test',stranger='qa-stranger@sites.test',now=new Date().toISOString();
for(const [email,role] of [[a,'employee'],[b,'employee'],[reviewer,'reviewer'],[stranger,'employee']])await db.prepare('INSERT INTO staff_members(email,name,role,active) VALUES(?,?,?,1)').bind(email,email,role).run();
async function req(email,path,payload){const res=await mf.dispatchFetch('https://synapse.test'+path,{method:payload?'POST':'GET',headers:{'oai-authenticated-user-id':'qa:'+email,'oai-authenticated-user-email':email,'Origin':'https://synapse.test','Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{})});const data=await res.json();return {status:res.status,data}}
const base={kind:'task',title:'وظیفه آزمون محلی',body:'گزارش دقیق',assignee:a,reviewer,priority:'high',due:'2026-11-14',scheduledDate:'2026-11-11',startTime:'09:00',endTime:'10:00',collaborators:[b],approvalRequired:true,reminder:true};
let result=await req(owner,'/api/work',{...base,action:'create'});assert.equal(result.status,200,JSON.stringify(result));const id=result.data.id;
const read=async(email)=>{const r=await req(email,'/api/staff');assert.equal(r.status,200,JSON.stringify(r));return r.data};
let d=await read(a),r=d.records.find(x=>x.id===id);assert.equal(r.scheduledDate,'2026-11-11');assert.equal((await read(b)).records.some(x=>x.id===id),true);assert.equal((await read(stranger)).records.some(x=>x.id===id),false);
assert.equal((await req(a,'/api/work',{...base,action:'create'})).status,403);
assert.equal((await req(stranger,'/api/work',{action:'comment',id,revision:r.revision,body:'not allowed'})).status,403);
assert.equal((await req(a,'/api/work',{action:'update',id,revision:r.revision,status:'doing',progress:20,result:'شروع شد'})).status,200);
assert.equal((await req(a,'/api/work',{action:'update',id,revision:r.revision,status:'blocked',result:'stale',blockReason:'wait',nextActor:b})).status,409);
r=(await read(a)).records.find(x=>x.id===id);
assert.equal((await req(a,'/api/work',{action:'comment',id,revision:r.revision,body:'@همکار لطفاً بررسی کن',mentions:[b]})).status,200);
let notices=await req(b,'/api/work/notifications');assert.equal(notices.status,200,JSON.stringify(notices));assert.ok(notices.data.items.some(n=>n.record_id===id&&!n.read_at));const n=notices.data.items.find(n=>n.record_id===id);assert.equal((await req(b,'/api/work/notifications',{id:n.id,record_id:id})).status,200);assert.ok((await req(b,'/api/work/notifications')).data.items.find(x=>x.id===n.id).read_at);
r=(await read(a)).records.find(x=>x.id===id);assert.equal((await req(a,'/api/work',{action:'update',id,revision:r.revision,status:'review',result:'گزارش تکمیل شده',progress:90})).status,200);
r=(await read(reviewer)).records.find(x=>x.id===id);assert.equal(r.status,'review');
assert.equal((await req(reviewer,'/api/work',{action:'information',id,revision:r.revision,body:'مدرک تکمیلی لازم است'})).status,200);
r=(await read(reviewer)).records.find(x=>x.id===id);assert.equal((await req(reviewer,'/api/work',{action:'update',id,revision:r.revision,status:'changes',reason:'پیوست تکمیلی لازم است'})).status,200);
r=(await read(a)).records.find(x=>x.id===id);assert.equal(r.status,'changes');assert.ok((await read(a)).events.some(e=>e.record_id===id&&e.action==='return'&&e.body.includes('پیوست')));
assert.equal((await req(a,'/api/work',{action:'update',id,revision:r.revision,status:'review',result:'مدرک افزوده شد'})).status,200);
r=(await read(reviewer)).records.find(x=>x.id===id);assert.equal((await req(reviewer,'/api/work',{action:'update',id,revision:r.revision,status:'done',evidenceUrl:'https://tampered.test'})).status,403);
assert.equal((await req(reviewer,'/api/work',{action:'update',id,revision:r.revision,status:'done'})).status,200);
r=(await read(a)).records.find(x=>x.id===id);assert.equal(r.status,'done');assert.equal(r.progress,100);
// The same Revision used in two parallel operations can succeed only once.
result=await req(owner,'/api/work',{...base,action:'create',approvalRequired:false});const concurrentId=result.data.id;
const concurrent=await Promise.all([req(a,'/api/work',{action:'update',id:concurrentId,revision:1,status:'doing',result:'first'}),req(a,'/api/work',{action:'update',id:concurrentId,revision:1,status:'doing',result:'second'})]);assert.deepEqual(concurrent.map(x=>x.status).sort(),[200,409]);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM staff_events WHERE record_id=?').bind(concurrentId).first()).n,2);
// Both the new UI and old API paths enforce the same correction workflow.
let c=(await read(a)).records.find(x=>x.id===concurrentId);
assert.equal((await req(a,'/api/staff',{action:'update',id:c.id,revision:c.revision,status:'changes',result:'bypass'})).status,400);
const uploadBody=new FormData();uploadBody.set('id',c.id);uploadBody.set('revision',String(c.revision));uploadBody.set('file',new File(['local evidence'],'evidence.txt',{type:'text/plain'}));
const encodedUpload=new Request('https://synapse.test/api/work/files',{method:'POST',body:uploadBody});
const uploaded=await mf.dispatchFetch('https://synapse.test/api/work/files',{method:'POST',headers:{'Origin':'https://synapse.test','oai-authenticated-user-id':'qa:'+a,'oai-authenticated-user-email':a,'Content-Type':encodedUpload.headers.get('content-type')},body:await encodedUpload.arrayBuffer()});const ud=await uploaded.json();assert.equal(uploaded.status,200,JSON.stringify(ud));
const downloaded=await mf.dispatchFetch('https://synapse.test/api/work/files?id='+ud.id,{headers:{'oai-authenticated-user-id':'qa:'+b,'oai-authenticated-user-email':b}});assert.equal(downloaded.status,200);assert.equal(await downloaded.text(),'local evidence');
const rejectedFile=await mf.dispatchFetch('https://synapse.test/api/work/files?id='+ud.id,{headers:{'oai-authenticated-user-id':'qa:'+stranger,'oai-authenticated-user-email':stranger}});assert.equal(rejectedFile.status,403);
c=(await read(a)).records.find(x=>x.id===concurrentId);assert.equal((await req(a,'/api/work',{action:'collaborate',id:c.id,revision:c.revision,recipient:owner,body:'درخواست راهنمایی از مدیر'})).status,200);
assert.ok((await req(owner,'/api/work/notifications')).data.items.some(n=>n.record_id===c.id&&n.body.includes('همکاری')));
// One central task changes schedule without an extra calendar record.
c=(await read(owner)).records.find(x=>x.id===concurrentId);const countBefore=(await db.prepare('SELECT COUNT(*) AS n FROM staff_records').first()).n;
assert.equal((await req(owner,'/api/work',{...base,action:'edit',id:c.id,revision:c.revision,scheduledDate:'2026-11-15',startTime:'11:00',endTime:'12:00',approvalRequired:false})).status,200);
assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM staff_records').first()).n,countBefore);c=(await read(a)).records.find(x=>x.id===concurrentId);assert.equal(c.scheduledDate,'2026-11-15');assert.equal(c.due,'2026-11-14');
assert.equal((await req(a,'/api/work',{action:'update',id:c.id,revision:c.revision,status:'done',result:'انجام بدون تأیید اجباری مالک'})).status,200);
// Server-rendered navigation and data are consistent across mobile and desktop identities.
for(const userAgent of ['Mozilla/5.0 (iPhone; Mobile)','Mozilla/5.0 (X11; Linux x86_64)']){
 const page=await mf.dispatchFetch('https://synapse.test/staff?view=overview',{headers:{'oai-authenticated-user-id':'qa:'+a,'oai-authenticated-user-email':a,'User-Agent':userAgent}});assert.equal(page.status,200);const html=await page.text();for(const label of ['امروز من','همه وظایف','برد وظایف','برنامه‌ریزی','بررسی و تأیید'])assert.ok(html.includes(label),label);
}
const localDay=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const reminder=await req(owner,'/api/work',{...base,action:'create',due:localDay,scheduledDate:localDay});assert.equal(reminder.status,200);const reminderId=reminder.data.id;
for(const email of [a,b]){const ns=(await req(email,'/api/work/notifications')).data.items.filter(n=>n.record_id===reminderId&&n.id.startsWith('due:'));assert.equal(ns.length,1);assert.equal((await req(email,'/api/work/notifications',{id:ns[0].id,record_id:reminderId})).status,200);assert.ok((await req(email,'/api/work/notifications')).data.items.find(n=>n.id===ns[0].id).read_at)}
// 1,101 source records; pagination must not silently truncate work or events.
for(let start=0;start<1101;start+=100)await db.batch(Array.from({length:Math.min(100,1101-start)},(_,j)=>db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind('bulk-'+(start+j),'task','bulk','',a,reviewer,owner,now)));
assert.equal((await read(a)).records.filter(x=>x.id.startsWith('bulk-')).length,1101);
await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind('existing-project','project','project unchanged','source',owner,owner,'legacy-import',now).run();const before=await db.prepare("SELECT * FROM staff_records WHERE id='existing-project'").first();await req(owner,'/api/staff');assert.deepEqual(await db.prepare("SELECT * FROM staff_records WHERE id='existing-project'").first(),before);
console.log('PASS: local Worker API, collaborations, real notifications/read state, permission isolation, actual attachment download, legacy route protection, employee-manager cooperation, schedule edit without duplication, revision conflict, delegated approval/correction history, >1000 records, and unchanged project source.');
