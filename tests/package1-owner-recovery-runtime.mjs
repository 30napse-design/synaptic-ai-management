import assert from 'node:assert/strict';
// All accounts, credentials and rows are disposable synthetic fixtures.
const base='https://synapse.test',native={'oai-authenticated-user-id':'owner-recovery-fixture','oai-authenticated-user-email':'ekramiihamid@gmail.com'},ownerId='ekramiihamid@gmail.com';let checks=0;
async function call(path,body,h=native,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...h,Origin:base,'Content-Type':'application/json','cf-connecting-ip':'owner-recovery-fixture'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,path+': '+JSON.stringify(d));checks++;return {r,d}}
const api=async(b,status=200,h=native)=>(await call('/api/auth/accounts',b,h,status)).d;
const pre=(await api({action:'activation_preflight',environment_commit:'f'.repeat(40),backup_reference:'synthetic://owner-recovery',backup_sha256:'a'.repeat(64),restore_verified:true,restore_evidence:'Synthetic isolated fixture only',confirm_environment:true})).id;
const provision={action:'owner_login',password:'Aa123456',confirm_owner_login:true,preflight_id:pre,reason:'Synthetic native-owner approval'};
await api(provision);assert.equal((await api()).owner_login_available,true);
let login=await call('/api/auth/login',{username:'owner',password:'Aa123456'},{});let cookie={Cookie:login.r.headers.get('set-cookie').split(';')[0]};const changed=await call('/api/auth/password',{currentPassword:'Aa123456',newPassword:'Bb123456'},cookie);cookie={Cookie:changed.r.headers.get('set-cookie').split(';')[0]};
assert.equal((await api(undefined,200,cookie)).owner_login_available,false);await api(provision,403,cookie);
await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind('owner-recovery-retain','task','Synthetic retained task','Synthetic',ownerId,ownerId,ownerId,'then').run();
await db.prepare('INSERT INTO staff_events(id,record_id,actor,action,body,created_at) VALUES(?,?,?,?,?,?)').bind('owner-recovery-history','owner-recovery-retain',ownerId,'comment','Synthetic retained history','then').run();
await db.prepare('UPDATE staff_members SET active=0 WHERE email=?').bind(ownerId).run();await db.prepare("UPDATE staff_accounts SET permissions='[\"people\"]' WHERE username='owner'").run();
await call('/api/auth/login',{username:'owner',password:'Bb123456'},{},401);
await api({...provision,password:'Cc123456'});await call('/api/auth/login',{username:'owner',password:'Bb123456'},{},401);
login=await call('/api/auth/login',{username:'owner',password:'Cc123456'},{});cookie={Cookie:login.r.headers.get('set-cookie').split(';')[0]};await call('/api/staff',undefined,cookie,403);
const rotated=await call('/api/auth/password',{currentPassword:'Cc123456',newPassword:'Dd123456'},cookie);cookie={Cookie:rotated.r.headers.get('set-cookie').split(';')[0]};const staff=(await call('/api/staff',undefined,cookie)).d;assert.equal(staff.user.email,ownerId);assert.equal(staff.user.manager,true);
assert.equal((await db.prepare('SELECT assignee FROM staff_records WHERE id=?').bind('owner-recovery-retain').first()).assignee,ownerId);assert.equal((await db.prepare('SELECT actor FROM staff_events WHERE id=?').bind('owner-recovery-history').first()).actor,ownerId);
// A username collision belonging to another member must never be taken over.
await db.prepare("UPDATE staff_accounts SET username='old-owner-binding' WHERE username='owner'").run();await api({...provision,password:'Ee123456'},409);
assert.equal((await db.prepare('SELECT username FROM staff_accounts WHERE member_id=?').bind(ownerId).first()).username,'old-owner-binding');
await api({action:'create',username:'owner',name:'Synthetic rejected',password:'Aa123456'},403);
console.log('PASS owner recovery: '+checks+' HTTP checks; native-only recovery, local-form eligibility, locked account reactivation, privilege restoration, old credential/session revocation, required rotation, stable history and alias collision refusal. No live state.');
