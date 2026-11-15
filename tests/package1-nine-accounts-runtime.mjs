import assert from 'node:assert/strict';
const base='https://synapse.test',native={'oai-authenticated-user-id':'package1-native-owner','oai-authenticated-user-email':'ekramiihamid@gmail.com'};let checks=0;
async function call(path,body,h=native,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...h,Origin:base,'Content-Type':'application/json','cf-connecting-ip':'package1-'+(body?.username||'fixture')},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={html:text}}assert.equal(r.status,status,path+': '+JSON.stringify(d));checks++;return {d,r}}
const api=async(b,status=200,h=native)=>(await call('/api/auth/accounts',b,h,status)).d;
const pre=(await api({action:'activation_preflight',environment_commit:'f'.repeat(40),backup_reference:'synthetic://restored-package1',backup_sha256:'a'.repeat(64),restore_verified:true,restore_evidence:'Synthetic restore fixture',confirm_environment:true})).id;
const list=await api();assert.deepEqual(list.account_plan.map(p=>p.username),['owner','executive','customer','scientific','finance','research','admin','it','specialist']);
await api({action:'create',username:'owner',name:'Synthetic attacker',password:'Aa123456',permissions:['institute_admin']},403);
await api({action:'owner_login',password:'Aa123456',confirm_owner_login:true,reason:'Synthetic verified owner'},409);
await api({action:'owner_login',password:'Aa123456',confirm_owner_login:true,preflight_id:pre,reason:'Synthetic native owner establishes login'});
const users={};
for(const p of list.account_plan){
 if(p.username!=='owner')await api({action:'create',username:p.username,name:'Synthetic '+p.title,password:'Aa123456',roles:[p.role]});
 const login=await call('/api/auth/login',{username:p.username,password:'Aa123456'},{});let h={Cookie:login.r.headers.get('set-cookie').split(';')[0]};await call('/api/staff',undefined,h,403);
 const pw=await call('/api/auth/password',{currentPassword:'Aa123456',newPassword:'Bb123456'},h);h={Cookie:pw.r.headers.get('set-cookie').split(';')[0]};users[p.username]=h;
 const staff=(await call('/api/staff',undefined,h)).d;assert.equal(staff.user.username,p.username);assert.equal(staff.user.manager,p.username==='owner');assert.ok(staff.organization.roles.some(r=>r.code===p.role));
 for(const view of ['overview','board','plans','approvals']){const page=(await call('/staff?view='+view,undefined,h)).d.html;assert.ok(page.includes('Ctrl + K'));if(view==='overview')assert.ok(page.includes('نقش و مسئولیت‌های من'));}
 await call('/account',undefined,h);await call('/api/work/notifications',undefined,h);await call('/api/header/messages',undefined,h);const ai=(await call('/api/assistant',undefined,h)).d;assert.equal(ai.connected,false);
 if(p.username!=='owner')await api(undefined,403,h);
}
const customerProfile=await api({action:'role_preview',username:'customer',roles:['customer_manager'],qualified:false});await api({...customerProfile,action:'apply_roles',username:'customer',confirm_replace:true,preflight_id:pre,reason:'Synthetic explicit owner confirmation of short-login profile'});
const ownerData=(await call('/api/staff',undefined,users.owner)).d;assert.equal(ownerData.user.email,'ekramiihamid@gmail.com');
await api({action:'owner_login',password:'Cc123456',confirm_owner_login:true,preflight_id:pre,reason:'Local owner cannot impersonate native recovery'},403,users.owner);
for(const path of ['/','/operations','/finance/dashboard','/finance/petty-cash','/laboratories/internal','/work/science','/accounts','/account','/manage/management']){const page=(await call(path,undefined,users.owner)).d.html;assert.ok(page.includes('Ctrl + K'),path)}
const executive=(await call('/api/staff',undefined,users.executive)).d.user;assert.ok(!executive.permissions.includes('finance_approve'));assert.ok(!executive.permissions.includes('science_approve'));await call('/api/finance',undefined,users.executive,403);
const specialist=(await call('/api/staff',undefined,users.specialist)).d;assert.equal(specialist.organization.roles[0].definition.reports_to,'research_manager');assert.ok(!specialist.user.permissions.includes('science_approve'));
console.log('PASS package one: '+checks+' HTTP/SSR checks; all nine short logins, real password/session flow, stable owner binding, role workspaces, shared header on representative routes, notifications/mail/AI, and restricted privileges. Isolated synthetic data only.');
