import {env} from 'cloudflare:workers';
import {db,json,mutationAllowed} from './staff-server';
import {requestOrigin} from './request-origin';
import {passwordHash,randomToken,equal,rateAllowed} from './staff-auth';
import {passwordMinimum} from './org-access';
import {passwordValid} from './auth-policy';
import {OWNER} from './staff-policy';

const marker='standalone-initial-owner';
function configured(){return process.env.SYNAPSE_STANDALONE_BUILD==='1'&&typeof (env as any).STAFF_ACCOUNT_SETUP_TOKEN==='string'&&(env as any).STAFF_ACCOUNT_SETUP_TOKEN.length>=32&&(env as any).STAFF_ACCOUNT_SETUP_TOKEN.length<=512&&typeof (env as any).STAFF_AUTH_PEPPER==='string'&&(env as any).STAFF_AUTH_PEPPER.length>=32}
export async function standaloneOwnerSetupAvailable(){
 if(!configured())return false;
 return !await db().prepare('SELECT username FROM staff_accounts LIMIT 1').first()&&!await db().prepare('SELECT id FROM staff_auth_settings WHERE id=?').bind(marker).first()&&!await db().prepare('SELECT email FROM staff_members WHERE email=?').bind(OWNER).first();
}
export async function setupStandaloneOwner(req:Request){
 if(!configured())return json({error:'راه‌اندازی اولیه فعال نیست؛ تنظیم امن میزبان لازم است.'},404);
 if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);
 const origin=new URL(requestOrigin(req));
 if(origin.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(origin.hostname))return json({error:'راه‌اندازی مالک به HTTPS نیاز دارد.'},403);
 try{
  if(!await rateAllowed('standalone-owner-setup',6))return json({error:'تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر تلاش کنید.'},429);
  const token=req.headers.get('x-synapse-setup')||'';
  if(token.length>512||!equal(token,(env as any).STAFF_ACCOUNT_SETUP_TOKEN))return json({error:'مجوز راه‌اندازی معتبر نیست.'},403);
  if(Number(req.headers.get('content-length')||0)>4000)return json({error:'درخواست بزرگ است.'},413);
  const text=await req.text();if(text.length>4000)return json({error:'درخواست بزرگ است.'},413);
  let body:any;try{body=JSON.parse(text)}catch{return json({error:'درخواست معتبر نیست.'},400)}
  if(!body||body.action!=='initial_owner'||body.confirmInitialOwner!==true||typeof body.name!=='string'||!body.name.trim()||body.name.length>100||!passwordValid(body.password,await passwordMinimum()))return json({error:'نام، رمز معتبر و تأیید ایجاد مدیر اولیه لازم است.'},400);
  const salt=randomToken(),hash=await passwordHash(body.password,salt),at=new Date().toISOString();
  // The existing DB adapter executes this batch transactionally. Its shared
  // write lock serializes PostgreSQL contenders; changes() guards every row.
  const result=await db().batch([
   db().prepare('INSERT INTO staff_auth_settings(id,value) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM staff_accounts) AND NOT EXISTS(SELECT 1 FROM staff_members WHERE email=?) ON CONFLICT(id) DO NOTHING').bind(marker,JSON.stringify({at,username:'owner'}),OWNER),
   db().prepare("INSERT INTO staff_members(email,name,role,active) SELECT ?,?,'manager',1 WHERE changes()=1").bind(OWNER,body.name.trim()),
   db().prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at) SELECT 'owner',?,?,?,1,?,? WHERE changes()=1").bind(OWNER,hash,salt,JSON.stringify(['people','projects','lab','mail','institute_admin']),at),
   db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,'auth',?,'standalone-owner-created',?,? WHERE changes()=1").bind(crypto.randomUUID(),OWNER,JSON.stringify({username:'owner',must_change:true,authorization:'host-setup-secret'}),at),
  ]);
  if(!result[0].meta.changes)return json({error:'حساب یا هویت قبلی وجود دارد؛ راه‌اندازی اولیه مجاز نیست.'},409);
  return json({ok:true,username:'owner',mustChangePassword:true,next:'/login'});
 }catch{return json({error:'راه‌اندازی انجام نشد؛ دیتابیس و تنظیمات امن را بررسی کنید.'},503)}
}
