import assert from 'node:assert/strict';
const base='https://synapse.test',owner={'oai-authenticated-user-id':'workspace-repair-fixture','oai-authenticated-user-email':'ekramiihamid@gmail.com'};let checks=0;
async function api(path,body,headers=owner,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...headers,Origin:base,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),text=await r.text();let value;try{value=JSON.parse(text)}catch{value={html:text}}assert.equal(r.status,status,path+' '+text.slice(0,300));checks++;return value}
for(const path of ['/', '/staff?view=overview','/staff?view=all','/staff?view=board','/staff?view=plans','/staff?view=approvals','/operations','/sample-intake','/work/projects','/work/science','/work/mail','/work/development','/work/leadership','/laboratories','/laboratories?view=new','/laboratories?domain=imaging','/manage/chats','/manage/connections','/accounts','/account',...['dashboard','invoices','pricing','receipts','payables','bank','petty-cash','ledger'].map(p=>'/finance/'+p)]){
 const {html}=await api(path);assert.ok(!/\d+:E\{/.test(html),'No streamed server exception: '+path);
 assert.ok(html.includes('workspace-navigation'),path+' must retain shared navigation');
 assert.equal((html.match(/class="nav-group"/g)||[]).length,6,path+' six navigation groups');
 assert.ok(html.includes('جست‌وجو در سوابق مجاز سامانه'));
 if(path==='/'){assert.equal((html.match(/class="workspace-preview"/g)||[]).length,6);assert.ok(!html.includes('به فضای کاری پژوهشکده خوش آمدید'));for(const href of ['/operations?new=call','/staff?view=all&amp;new=task','/staff?view=plans','/operations?new=request'])assert.ok(html.includes(href),href)}
}
await api('/api/manager-tools?section=chats',null,{},403);
const tools=await api('/api/manager-tools?section=chats');assert.ok(tools.script.includes('synapse-chats-v1:ekramiihamid%40gmail.com'));assert.ok(!tools.script.includes('window.scrollTo(0,0)'));
const bucket=await mf.getR2Bucket('BUCKET');
await db.prepare("INSERT INTO staff_records(id,kind,title,assignee,reviewer,created_by,updated_at) VALUES('preview-task','task','Synthetic private preview',?,?,?,'then')").bind(owner['oai-authenticated-user-email'],owner['oai-authenticated-user-email'],owner['oai-authenticated-user-email']).run();
for(const [id,mime,bytes] of [['preview-image','image/png',new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0,0,0,0,0])],['preview-unsafe','image/png',new TextEncoder().encode('<svg onload="alert(1)"></svg>')]]){
 await bucket.put('synthetic/'+id,bytes);await db.prepare("INSERT INTO staff_work_files(id,record_id,file_name,mime,size,object_key,created_by,created_at) VALUES(?,'preview-task',?,?,?,?,?,'then')").bind(id,id+'.png',mime,bytes.length,'synthetic/'+id,owner['oai-authenticated-user-email']).run();
}
let preview=await fetch(base+'/api/work/files?id=preview-image&preview=1',{headers:owner});assert.equal(preview.status,200);assert.equal(preview.headers.get('content-type'),'image/png');assert.ok(preview.headers.get('content-disposition').startsWith('inline'));assert.equal(preview.headers.get('cache-control'),'private,no-store');checks++;
await api('/api/work/files?id=preview-image&preview=1',null,{},403);
await db.prepare("INSERT INTO staff_members(email,name,role) VALUES('preview-other@example.invalid','Synthetic unrelated colleague','employee')").run();
await api('/api/work/files?id=preview-image&preview=1',null,{'oai-authenticated-user-id':'preview-other','oai-authenticated-user-email':'preview-other@example.invalid'},403);
await api('/api/work/files?id=preview-unsafe&preview=1',null,owner,415);
preview=await fetch(base+'/api/work/files?id=preview-unsafe',{headers:owner});assert.equal(preview.status,200);assert.ok(preview.headers.get('content-disposition').startsWith('attachment'));checks++;
const taskPage=await api('/staff?id=preview-task');assert.ok(taskPage.html.includes('preview-image.png'));assert.equal((await api('/api/staff')).files.find(f=>f.id==='preview-image').mime,'image/png');
// Source upload and revision tests operate entirely inside this disposable D1/R2.
const form=new FormData();form.set('file',new File(['Synthetic approved procedure'],'synthetic-procedure.txt',{type:'text/plain'}));form.set('title','Synthetic source');form.set('category','staff');
const encoded=new Request(base+'/api/integrations/knowledge',{method:'POST',body:form}),r=await fetch(base+'/api/integrations/knowledge',{method:'POST',headers:{...owner,Origin:base,'Content-Type':encoded.headers.get('content-type')},body:await encoded.arrayBuffer()}),doc=await r.json();assert.equal(r.status,200,JSON.stringify(doc));checks++;
const original=JSON.parse((await db.prepare('SELECT value FROM staff_auth_settings WHERE id=?').bind('knowledge:'+doc.id).first()).value);assert.ok(original.file.object_key);
await api('/api/integrations',{action:'knowledge_save',id:doc.id,revision:1,title:'Synthetic revision two',text:'Synthetic updated procedure',category:'staff',approved:true,active:true});
const updated=JSON.parse((await db.prepare('SELECT value FROM staff_auth_settings WHERE id=?').bind('knowledge:'+doc.id).first()).value);assert.equal(updated.version,'2');assert.equal(updated.versions.length,2);assert.deepEqual(updated.file,original.file);
await api('/api/integrations',{action:'knowledge_save',id:doc.id,revision:1,title:'Stale edit',text:'Must not replace',category:'staff'},owner,409);
await api('/api/integrations/knowledge?id='+doc.id,null,{},401);
assert.equal((await api('/api/integrations/knowledge?id='+doc.id)).text,'Synthetic updated procedure');
console.log('PASS workspace repair: '+checks+' isolated HTTP/SSR checks; 28 existing workspace routes, six shared navigation groups, real home links, scoped legacy script, versioned knowledge upload/edit/conflict and attachment preservation. This is not browser or live-account acceptance.');
