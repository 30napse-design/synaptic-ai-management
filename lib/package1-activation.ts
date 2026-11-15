import {env} from 'cloudflare:workers';
import {db,eventStmt} from './staff-server';
import {OWNER} from './staff-policy';
import {orgRoleCatalog,orgProfilePermissions} from './org-role-catalog';
import {organizationalLogins} from './organizational-logins';
import {prepareAccount} from './staff-accounts';
import {passwordHash,passwordHash as hashPassword,randomToken,digest} from './staff-auth';
import {passwordMinimum,organizationReady} from './org-access';
import {passwordValid} from './auth-policy';
import {isPrimaryOwner} from './work-assignment-policy';
import {workflowMust as must,workflowEvent} from './workflow-policy';

const vaultId='package1-initial-credentials';
async function vaultKey(){const pepper=(env as any).STAFF_AUTH_PEPPER;must(pepper,'Authentication unavailable',503);return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode('synapse-initial-delivery-v1\0'+pepper)),'AES-GCM',false,['encrypt','decrypt'])}
async function seal(value:any){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await vaultKey(),new TextEncoder().encode(JSON.stringify(value)));return JSON.stringify({iv:Array.from(iv),cipher:Array.from(new Uint8Array(encrypted))})}
async function open(raw:string){const b=JSON.parse(raw);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(b.iv)},await vaultKey(),new Uint8Array(b.cipher))))}
export async function readInitialCredentials(u:any){must(isPrimaryOwner(u),'دریافت رمزهای اولیه فقط برای مالک اصلی مجاز است.',403);const v=await db().prepare('SELECT value FROM staff_auth_settings WHERE id=?').bind(vaultId).first<any>();if(!v)return {ok:true,initial_credentials:[]};const saved=await open(v.value),out=[];for(const c of saved){const a=await db().prepare('SELECT password_hash,salt,must_change FROM staff_accounts WHERE username=?').bind(c.username).first<any>();if(c.password&&a?.must_change&&(c.fingerprint?await digest(a.password_hash+'\0'+a.salt)===c.fingerprint:await passwordHash(c.password,a.salt)===a.password_hash))out.push({username:c.username,password:c.password,note:'تغییر رمز در اولین ورود الزامی است.'});else out.push({username:c.username,password:null,note:c.password?'رمز اولیه تغییر کرده است؛ از مسیر مجاز بازنشانی استفاده کنید.':'حساب موجود است؛ رمز قبلی بدون تغییر حفظ شده است.'})}await db().batch([await eventStmt('auth',u.email,'initial-credentials-accessed',JSON.stringify({usernames:out.map(x=>x.username),passwords_logged:false}))]);return {ok:true,initial_credentials:out}}

// Called only AFTER the existing expiring, exact-body-hash provisioning grant is verified.
// This grant is configured by the hosting owner; it is not a public impersonation API.
export async function activatePackage1(c:any,b:any){
 must(c.scope==='package1-activation'&&c.expires_at-Date.now()<=60*60*1000,'مجوز اختصاصی و زمان‌دار فعال‌سازی لازم است.',403);
 must(b.package1_activation===true&&b.accept_without_restored_backup===true&&b.non_destructive_confirmed===true&&typeof b.owner_consent==='string'&&b.owner_consent.length>=20&&b.owner_consent.length<=2000,'پذیرش صریح ریسک مالک و تأیید غیرمخرب‌بودن لازم است.');
 must(await organizationReady(),'Migrationهای لازم هنوز کامل نیستند.',503);
 const names=['owner',...orgRoleCatalog.map(r=>organizationalLogins[r.role_key])];
 must(Array.isArray(b.accounts)&&b.accounts.length===9&&new Set(b.accounts.map((a:any)=>a.username)).size===9&&names.every(n=>b.accounts.some((a:any)=>a.username===n)),'فقط نه نام نهایی مصوب مجازند.');
 const existing=(await db().prepare('SELECT a.*,m.active FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id').all()).results as any[];
 must(!existing.some(a=>names.includes(a.username)||a.member_id===OWNER),'نام مقصد یا ورود مالک از قبل موجود است؛ هیچ حسابی بازنویسی نمی‌شود.',409);
 const oldSources:Record<string,string>={scientific:'mazaheri',admin:'shakiba'},ts=new Date().toISOString(),q:any[]=[],deliveries:any[]=[],result:any[]=[];
 const marker='request:'+c.id; q.push(db().prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?)').bind(marker,ts));
 for(const username of names){
  const input=b.accounts.find((a:any)=>a.username===username),definition=orgRoleCatalog.find(r=>organizationalLogins[r.role_key]===username),source=oldSources[username];
  const position=username==='owner'?'management':definition!.role_key,p=await db().prepare('SELECT id,active,role_definition FROM workflow_positions WHERE code=?').bind(position).first<any>();must(p?.active,'تعریف سمت فعال موجود نیست: '+position,409);
  if(definition)must(JSON.stringify(JSON.parse(p.role_definition).permissions)===JSON.stringify(definition.permissions),'مجوز نقش با الگوی مصوب تفاوت دارد.',409);
  const assignment=await db().prepare("SELECT id FROM workflow_position_assignments WHERE position_id=? AND scope_type='institute' AND scope_id=''").bind(p.id).first();must(!assignment,'سمت از قبل انتصاب دارد؛ از مسیر موجود مدیریت سمت بررسی شود.',409);
  const permissions=definition?orgProfilePermissions([definition],false):['people','projects','lab','mail','institute_admin'];let member:string;
  if(source){const old=existing.find(a=>a.username===source);must(old?.active&&old.member_id===input.expected_member_id,'هویت یا وضعیت حساب مبدأ با مجوز مالک یکسان نیست.',409);must(input.password===undefined,'رمز حساب موجود تغییر نمی‌کند.');must(!await db().prepare('SELECT laboratory_id FROM laboratory_members WHERE member_id=?').bind(old.member_id).first(),'حساب آزمایشگاهی از این مسیر تبدیل نمی‌شود.',409);member=old.member_id;
   q.push(db().prepare("UPDATE staff_accounts SET username=?,permissions=?,org_roles=?,org_proposed_roles=?,org_mode='managed',scientific_qualified=0,org_revision=org_revision+1,updated_at=? WHERE username=? AND member_id=?").bind(username,JSON.stringify(permissions),JSON.stringify([position]),JSON.stringify([position]),ts,source,member));
   q.push(db().prepare('UPDATE staff_sessions SET expires_at=0 WHERE username=?').bind(source));deliveries.push({username,password:null});
  }else{must(passwordValid(input.password,await passwordMinimum()),'رمز اختصاصی معتبر لازم است.');const name=username==='owner'?'رئیس پژوهشکده':definition!.title_fa;
   if(username==='owner'){member=OWNER;const m=await db().prepare('SELECT active FROM staff_members WHERE email=?').bind(OWNER).first<any>();must(!m||m.active,'هویت مالک غیرفعال است؛ بازنشانی خودکار مجاز نیست.',409);const salt=randomToken(),hash=await passwordHash(input.password,salt);q.push(db().prepare('INSERT INTO staff_members(email,name,role,active) VALUES(?,?,?,1) ON CONFLICT(email) DO NOTHING').bind(member,name,'manager'),db().prepare('INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at) VALUES(?,?,?,?,1,?,?)').bind(username,member,hash,salt,JSON.stringify(permissions),ts));deliveries.push({username,password:input.password,fingerprint:await digest(hash+'\0'+salt)})}
   else{member='staff:'+username;const stmts=await prepareAccount(username,name,input.password,permissions);q.push(...stmts,db().prepare("UPDATE staff_accounts SET org_roles=?,org_proposed_roles=?,org_mode='managed',scientific_qualified=0,org_revision=1 WHERE username=?").bind(JSON.stringify([position]),JSON.stringify([position]),username));deliveries.push({username,password:input.password})}
  }
  const assignmentId=crypto.randomUUID();q.push(db().prepare("INSERT INTO workflow_position_assignments(id,position_id,scope_type,scope_id,primary_member_id,substitute_member_id,use_substitute,active,created_by,created_at,updated_at) VALUES(?,?,'institute','',?,'',0,1,?,?,?)").bind(assignmentId,p.id,member,OWNER,ts,ts),await eventStmt(assignmentId,OWNER,'workflow.v2.position_assignment.changed',JSON.stringify(workflowEvent('position_assignment',assignmentId,0,{position_id:p.id,scope_type:'institute',scope_id:'',before:null,after:{primary_member_id:member,substitute_member_id:'',use_substitute:0,active:1}}))));
  q.push(await eventStmt(member,OWNER,'package1-account-activated',JSON.stringify({request:c.id,username,previous_username:source||null,member_id:member,roles:username==='owner'?['management']:[position],existing_password_unchanged:!!source,previous_permissions:source?JSON.parse(existing.find(a=>a.username===source).permissions):[]})));result.push({username,member_id:member,role:position,password_preserved:!!source});
 }
 // Fingerprints for new ordinary accounts are populated after insertion, in finalize delivery.
 q.push(db().prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?)').bind(vaultId,await seal(deliveries)),await eventStmt('auth',OWNER,'package1-owner-risk-acceptance',JSON.stringify({request:c.id,restore_verified:false,owner_consent:b.owner_consent,migrations:['0018','0019','0020'],non_destructive_confirmed:true})));
 await db().batch(q);return {ok:true,request:c.id,accounts:result,credentials_location:'/accounts',existing_accounts_not_deactivated:true};
}

export async function finalizePackage1Credentials(c:any,b:any){
 must(c.scope==='package1-credential-finalize'&&c.expires_at-Date.now()<=60*60*1000,'مجوز زمان‌دار پایان آزمون لازم است.',403);must(b.package1_finalize===true&&Array.isArray(b.accounts)&&b.accounts.length===7,'فقط هفت حساب تازه مجازند.');
 const allowed=['owner','executive','customer','finance','research','it','specialist'];must(new Set(b.accounts.map((a:any)=>a.username)).size===7&&allowed.every(n=>b.accounts.some((a:any)=>a.username===n)),'فهرست حساب‌ها معتبر نیست.');
 must(typeof c.activation_request==='string'&&!!await db().prepare('SELECT id FROM staff_auth_settings WHERE id=?').bind('request:'+c.activation_request).first(),'رسید فعال‌سازی اصلی لازم است.',409);
 const rows:any[]=[];for(const x of b.accounts){const a=await db().prepare('SELECT * FROM staff_accounts WHERE username=?').bind(x.username).first<any>();must(a&&!!await db().prepare("SELECT id FROM staff_events WHERE record_id=? AND actor=? AND action='package1-account-activated' AND json_extract(body,'$.request')=? AND json_extract(body,'$.username')=?").bind(a.member_id,OWNER,c.activation_request,x.username).first()&&await hashPassword(x.password,a.salt)===a.password_hash,'رمز تحویل با آخرین رمز آزموده‌شده یکسان نیست.',409);rows.push({username:x.username,password:x.password,fingerprint:await digest(a.password_hash+'\0'+a.salt)})}
 rows.push({username:'scientific',password:null},{username:'admin',password:null});const q:any[]=[db().prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?)').bind('request:'+c.id,new Date().toISOString())];for(const a of rows.filter(x=>x.password))q.push(db().prepare('UPDATE staff_accounts SET must_change=1 WHERE username=?').bind(a.username),db().prepare('UPDATE staff_sessions SET expires_at=0 WHERE username=?').bind(a.username));q.push(db().prepare('UPDATE staff_auth_settings SET value=? WHERE id=?').bind(await seal(rows),vaultId),await eventStmt('auth',OWNER,'package1-initial-credentials-ready',JSON.stringify({usernames:allowed,stored_encrypted:true,old_passwords_preserved:['scientific','admin']})));await db().batch(q);return {ok:true,credentials_location:'/accounts',passwords_returned:false};
}
