import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {accountTransferPlan,accountTransferPostgresSQL,accountTransferSource} from '../lib/staff-account-transfer.mjs';
import {AVAILABLE_PERMISSIONS} from '../lib/auth-policy.ts';
import {organizationalLogins} from '../lib/organizational-logins.ts';

export async function runAccountTransferChecks({db,database,h,call,context,ownerCookie}){
 const owner='ekramiihamid@gmail.com',at=new Date().toISOString(),roles=Object.fromEntries(Object.entries(organizationalLogins).map(([r,n])=>[n,r]));
 const source={schema_version:1,source_project_id:accountTransferSource,accounts:[],members:[],assignments:[]};
 for(const [username,role] of Object.entries(roles)){
  const member=username==='scientific'?'staff:retained-scientist':username==='admin'?'staff:retained-administrator':'staff:'+username,salt='a'.repeat(64),password='SyntheticSource9';
  const position=await db.prepare('SELECT * FROM workflow_positions WHERE code=?').bind(role).first();
  const permissions=JSON.parse(position.role_definition).permissions;
  source.accounts.push({username,member_id:member,password_hash:await h.passwordHash(password,salt),salt,must_change:0,permissions:JSON.stringify(permissions),updated_at:at,org_roles:JSON.stringify([role]),org_proposed_roles:JSON.stringify([role]),org_mode:'managed',scientific_qualified:0,org_revision:1});
  source.members.push({email:member,user_id:null,name:username==='admin'?"Synthetic O'Malley $synapse_transfer$":'Synthetic '+username,role:'employee',active:1});
  source.assignments.push({id:'synthetic-assignment-'+username,position_id:position.id,scope_type:'institute',scope_id:'',primary_member_id:member,substitute_member_id:'',use_substitute:0,active:1,revision:0,created_by:owner,created_at:at,updated_at:at});
 }
 const before=await db.prepare("SELECT a.*,m.name,m.role,m.active FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id WHERE a.username='owner'").first();
 const state={accounts:(await db.prepare('SELECT username,member_id FROM staff_accounts').all()).results,members:(await db.prepare('SELECT email FROM staff_members').all()).results,positions:(await db.prepare('SELECT id,code,active FROM workflow_positions').all()).results,assignments:[]};
 const policy={owner,roles,permissions:AVAILABLE_PERMISSIONS};
 const plan=accountTransferPlan(source,state,policy);assert.equal(plan.create,8);assert.equal(plan.conflicts.length,0);
 const bad=structuredClone(source);bad.accounts[0].permissions='["people","institute_admin"]';assert.throws(()=>accountTransferPlan(bad,state,policy));
 const duplicate=structuredClone(source);duplicate.accounts.push(source.accounts[0]);assert.throws(()=>accountTransferPlan(duplicate,state,policy));
 const ownerPayload=structuredClone(source);ownerPayload.accounts[0].username='owner';assert.throws(()=>accountTransferPlan(ownerPayload,state,policy));
 const wrongAssignment=structuredClone(source);wrongAssignment.assignments[0].position_id=source.assignments[1].position_id;assert.throws(()=>accountTransferPlan(wrongAssignment,state,policy));
 // Run the exact privileged-operator SQL bridge against isolated PostgreSQL.
 const checksum=createHash('sha256').update(JSON.stringify(source)).digest('hex');
 const sql=accountTransferPostgresSQL(plan,{checksum,actor:'synthetic-operator',at});await database.exec(sql);await database.exec(sql);
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM staff_accounts').first()).n,9);
 assert.deepEqual(await db.prepare("SELECT a.*,m.name,m.role,m.active FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id WHERE a.username='owner'").first(),before);
 for(const sourceRow of source.accounts){const a=await db.prepare('SELECT * FROM staff_accounts WHERE username=?').bind(sourceRow.username).first();for(const key of ['member_id','permissions','org_roles','password_hash','salt','org_revision'])assert.equal(a[key],sourceRow[key],sourceRow.username+' '+key)}
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM workflow_position_assignments').first()).n,8);
 // Reset only this synthetic transfer so the owner API's fresh-apply path is
 // tested as well as the SQL bridge. The existing synthetic owner is retained.
 await database.exec('ALTER TABLE synapse.workflow_position_assignments DISABLE TRIGGER USER');
 await db.prepare('DELETE FROM workflow_position_assignments WHERE primary_member_id IN (SELECT value FROM json_each(?))').bind(JSON.stringify(source.accounts.map(a=>a.member_id))).run();
 await db.prepare('DELETE FROM staff_accounts WHERE username IN (SELECT value FROM json_each(?))').bind(JSON.stringify(source.accounts.map(a=>a.username))).run();
 await db.prepare('DELETE FROM staff_members WHERE email IN (SELECT value FROM json_each(?))').bind(JSON.stringify(source.accounts.map(a=>a.member_id))).run();
 await db.prepare('DELETE FROM staff_auth_settings WHERE id=?').bind('staff-account-transfer:'+checksum).run();
 await db.prepare("DELETE FROM staff_auth_settings WHERE id LIKE 'account-transfer-credential:%'").run();
 await database.exec('ALTER TABLE synapse.workflow_position_assignments ENABLE TRIGGER USER');
 const freshPreview=await call(h.accountWrite,{action:'account_transfer_preview',manifest:source},{cookie:ownerCookie});assert.equal(freshPreview.res.status,200);assert.equal(freshPreview.data.create,8);
 const applied=await call(h.accountWrite,{action:'account_transfer_apply',manifest:source,checksum:freshPreview.data.checksum,confirm:true},{cookie:ownerCookie});assert.equal(applied.res.status,200);assert.equal(applied.data.created,8);
 assert.deepEqual(await db.prepare("SELECT a.*,m.name,m.role,m.active FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id WHERE a.username='owner'").first(),before);
 const model=(await call(h.accounts,undefined,{cookie:ownerCookie})).data;
 assert.equal(model.organization_accounts.filter(a=>a.exists).length,9);assert.ok(model.organization_accounts.filter(a=>a.username!=='owner').every(a=>a.credential_pending&&!a.can_copy_initial));
 const preview=await call(h.accountWrite,{action:'account_transfer_preview',manifest:source},{cookie:ownerCookie});assert.equal(preview.res.status,200);assert.equal(preview.data.preserved,8);assert.equal(preview.data.alreadyApplied,true);
 const replay=await call(h.accountWrite,{action:'account_transfer_apply',manifest:source,checksum,confirm:true},{cookie:ownerCookie});assert.equal(replay.res.status,200);assert.equal(replay.data.created,0);
 assert.equal((await call(h.accountWrite,{action:'managed_edit',username:'scientific',name:'Synthetic approved scientist'},{cookie:ownerCookie})).res.status,200);
 assert.equal((await db.prepare("SELECT name FROM staff_members WHERE email='staff:retained-scientist'").first()).name,'Synthetic approved scientist');
 // Owner-only reset/copy use the existing encrypted destination credential vault.
 const changed=await call(h.accountWrite,{action:'managed_reset',username:'customer',password:'DestinationCustomer9'},{cookie:ownerCookie});assert.equal(changed.res.status,200);
 let credentials=await call(h.accountWrite,{action:'initial_credentials'},{cookie:ownerCookie});assert.equal(credentials.res.status,200);assert.equal(credentials.data.initial_credentials.find(c=>c.username==='customer').password,'DestinationCustomer9');
 let refreshed=(await call(h.accounts,undefined,{cookie:ownerCookie})).data.organization_accounts.find(a=>a.username==='customer');assert.equal(refreshed.can_copy_initial,true);assert.equal(refreshed.credential_pending,false);
 const oldLogin=await call(h.login,{username:'customer',password:'SyntheticSource9'});assert.equal(oldLogin.res.status,401);
 const login=await call(h.login,{username:'customer',password:'DestinationCustomer9'});assert.equal(login.res.status,200);assert.equal(login.data.next,'/account/password');
 assert.equal((await call(h.changePassword,{currentPassword:'DestinationCustomer9',newPassword:'CustomerHostinger8'},{cookie:login.cookie})).res.status,200);
 credentials=await call(h.accountWrite,{action:'initial_credentials'},{cookie:ownerCookie});assert.equal(credentials.data.initial_credentials.find(c=>c.username==='customer').password,null);
 refreshed=(await call(h.accounts,undefined,{cookie:ownerCookie})).data.organization_accounts.find(a=>a.username==='customer');assert.equal(refreshed.can_copy_initial,false);
 const sourceLogin=await call(h.login,{username:'executive',password:'SyntheticSource9'});assert.equal(sourceLogin.res.status,200);
 assert.equal((await call(h.accountWrite,{action:'account_transfer_preview',manifest:source},{cookie:sourceLogin.cookie})).res.status,403);
 assert.equal((await db.prepare('SELECT value FROM staff_auth_settings WHERE id=?').bind('account-transfer-credential:executive').first()).value.includes('verified-at-destination'),true);
 // A canonical username cannot invent grants absent from its stored source data.
 await db.prepare("UPDATE staff_accounts SET permissions='[\"people\"]' WHERE username='customer'").run();
 const restricted=await call(h.login,{username:'customer',password:'CustomerHostinger8'});const user=await context(restricted.cookie,h.identity);assert.equal(user.manager,false);assert.ok(!user.dataPermissions.includes('customer_ops'));assert.equal((await call(h.accounts,undefined,{cookie:restricted.cookie})).res.status,403);
 console.log('PASS account transfer: 8 PostgreSQL account/verifier/permission/assignment copies; owner unchanged, exact legacy member IDs, replay/no duplicate, escalation/conflict rejection, profile edit, destination reset, encrypted initial-password delivery, forced change and copy invalidation; no permissions inferred from job titles. Synthetic records only.');
}
