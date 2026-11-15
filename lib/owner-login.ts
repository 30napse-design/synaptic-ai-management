import {db,eventStmt} from './staff-server';
import {activationPreflight} from './account-handover';
import {isPrimaryOwner} from './work-assignment-policy';
import {OWNER} from './staff-policy';
import {passwordMinimum} from './org-access';
import {passwordValid} from './auth-policy';
import {passwordHash,randomToken} from './staff-auth';
import {workflowMust as must} from './workflow-policy';
// Only the already authenticated native owner can establish/recover this login.
// Existing native owner access is never removed; generic account creation cannot bind OWNER.
export async function provisionOwnerLogin(u:any,b:any){
 must(isPrimaryOwner(u)&&!u.local,'ایجاد یا بازیابی ورود مالک فقط از نشست اصلی احرازشده مالک مجاز است.',403);
 must(b.confirm_owner_login===true&&typeof b.reason==='string'&&!!b.reason.trim()&&b.reason.length<=2000,'تأیید اتصال ورود owner به هویت مالک و دلیل لازم است.');
 await activationPreflight(b.preflight_id);
 must(passwordValid(b.password,await passwordMinimum()),'رمز اولیه معتبر را مالک تعیین کند.');
 const taken=await db().prepare('SELECT member_id FROM staff_accounts WHERE username=?').bind('owner').first<any>();
 must(!taken||taken.member_id===OWNER,'نام owner به هویت دیگری متصل است؛ هیچ تغییری انجام نشد.',409);
 const old=await db().prepare('SELECT username FROM staff_accounts WHERE member_id=?').bind(OWNER).first<any>();
 must(!old||old.username==='owner','ورود دیگری به مالک متصل است؛ ابتدا تطبیق هویت و انتقال نام آن جداگانه تأیید شود.',409);
 const salt=randomToken(),hash=await passwordHash(b.password,salt),now=new Date().toISOString();
 const q=[db().prepare('INSERT INTO staff_members(email,name,role,active) VALUES(?,?,?,1) ON CONFLICT(email) DO UPDATE SET active=1').bind(OWNER,u.name,'manager'),db().prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at) VALUES('owner',?,?,?,1,?,?) ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash,salt=excluded.salt,must_change=1,permissions=excluded.permissions,updated_at=excluded.updated_at WHERE staff_accounts.member_id=excluded.member_id").bind(OWNER,hash,salt,JSON.stringify(['people','projects','lab','mail','institute_admin']),now),db().prepare("DELETE FROM staff_sessions WHERE username='owner'"),await eventStmt('auth',u.email,'owner-login-provisioned',JSON.stringify({member_id:OWNER,native_access_preserved:true,preflight_id:b.preflight_id,reason:b.reason}))];
 await db().batch(q);return {ok:true,username:'owner',must_change:true,native_access_preserved:true};
}
