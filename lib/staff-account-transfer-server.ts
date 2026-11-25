import {accountTransferPlan} from './staff-account-transfer.mjs';
import {db,eventStmt} from './staff-server';
import {isPrimaryOwner} from './work-assignment-policy';
import {workflowMust as must} from './workflow-policy';
import {AVAILABLE_PERMISSIONS} from './auth-policy';
import {OWNER} from './staff-policy';
import {organizationalLogins} from './organizational-logins';
import {digest} from './staff-auth';
export async function transferStaffAccounts(u:any,b:any){
 must(process.env.SYNAPSE_STANDALONE_BUILD==='1'&&isPrimaryOwner(u),'انتقال فقط با مالک اصلی در مقصد مستقل مجاز است.',403);
 const manifest=b.manifest,checksum=await digest(JSON.stringify(manifest));
 const state={accounts:(await db().prepare('SELECT username,member_id FROM staff_accounts').all()).results,members:(await db().prepare('SELECT email FROM staff_members').all()).results,positions:(await db().prepare('SELECT id,code,active FROM workflow_positions').all()).results,assignments:(await db().prepare('SELECT * FROM workflow_position_assignments').all()).results};
 let plan;try{plan=accountTransferPlan(manifest,state,{owner:OWNER,permissions:AVAILABLE_PERMISSIONS,roles:Object.fromEntries(Object.entries(organizationalLogins).map(([r,n])=>[n,r]))})}catch(error:any){must(false,error.message)}
 const marker='staff-account-transfer:'+checksum;
 const exists=await db().prepare('SELECT id FROM staff_auth_settings WHERE id=?').bind(marker).first();
 if(b.action==='account_transfer_preview')return {ok:true,checksum,items:plan!.items,conflicts:plan!.conflicts,create:plan!.create,preserved:plan!.preserved,credentialsNeedVerification:plan!.credentialsNeedVerification,alreadyApplied:!!exists};
 must(b.action==='account_transfer_apply'&&b.checksum===checksum&&b.confirm===true,'پیش‌نمایش و تأیید صریح بسته لازم است.',409);
 if(exists)return {ok:true,replayed:true,created:0};
 must(!plan!.conflicts.length,'تعارض وجود دارد؛ هیچ اطلاعاتی بازنویسی نمی‌شود.',409);
 must(plan!.create>0,'حساب تازه‌ای برای انتقال وجود ندارد.',409);
 const at=new Date().toISOString();
 const queries=[db().prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?)').bind(marker,JSON.stringify({source:manifest.source_project_id,at,actor:u.email,count:plan!.create})),...plan!.queries.map(q=>db().prepare(q.sql).bind(...q.args)),await eventStmt('auth',u.email,'staff-accounts-transferred',JSON.stringify({checksum,source:manifest.source_project_id,usernames:plan!.items.filter(i=>i.status==='create').map(i=>i.username),owner_unchanged:true,passwords_or_hashes_logged:false}))];
 await db().batch(queries);
 return {ok:true,created:plan!.create,credentialsNeedVerification:plan!.credentialsNeedVerification};
}
