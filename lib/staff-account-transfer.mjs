// Transfer plans contain private password verifiers. Never log a plan or commit
// a real manifest. Identity/permissions are copied, never inferred from a title.
import {postgresQuery} from '../runtime/postgres-sql.mjs';
export const accountTransferSource='appgprj_6af06be01a5481918c6578c73c9b888a';
const usernames=['executive','customer','scientific','finance','research','admin','it','specialist'];
export function accountTransferPlan(manifest,state,policy){
 const fail=message=>{throw new Error(message)};
 if(manifest?.schema_version!==1||manifest.source_project_id!==accountTransferSource||!Array.isArray(manifest.accounts)||!manifest.accounts.length||manifest.accounts.length>8||!Array.isArray(manifest.members)||!Array.isArray(manifest.assignments))fail('ساختار یا مرجع بسته انتقال معتبر نیست.');
 const queries=[],items=[],conflicts=[],seen=new Set(),memberIds=new Set();
 const array=value=>{try{const result=typeof value==='string'?JSON.parse(value):value;if(!Array.isArray(result)||!result.every(v=>typeof v==='string'))fail('آرایه مجوز یا نقش نامعتبر است.');return result}catch{fail('آرایه مجوز یا نقش نامعتبر است.')}};
 for(const a of manifest.accounts){
  if(!usernames.includes(a.username)||seen.has(a.username)||a.member_id===policy.owner||!a.member_id?.startsWith('staff:')||memberIds.has(a.member_id))fail('حساب تکراری، مالک یا شناسه نامعتبر در بسته انتقال است.');
  seen.add(a.username);memberIds.add(a.member_id);
  const m=manifest.members.find(m=>m.email===a.member_id),permissions=array(a.permissions),roles=array(a.org_roles),proposed=array(a.org_proposed_roles);
  if(!m||typeof m.name!=='string'||!m.name.trim()||m.name.length>100||!['employee','reviewer'].includes(m.role)||![0,1].includes(m.active)||!permissions.length||permissions.some(p=>!policy.permissions.includes(p)||p==='institute_admin')||roles.length!==1||roles[0]!==policy.roles[a.username]||proposed.some(r=>!Object.values(policy.roles).includes(r))||!['legacy','managed'].includes(a.org_mode)||![0,1].includes(a.must_change)||![0,1].includes(a.scientific_qualified)||a.scientific_qualified&&a.username!=='research'||permissions.includes('science_approve')&&!a.scientific_qualified||!Number.isSafeInteger(a.org_revision)||a.org_revision<0||!Number.isSafeInteger(a.updated_at?Date.parse(a.updated_at):NaN)||!/^[a-f0-9]{64}$/.test(a.password_hash)||!/^[a-f0-9]{64}$/.test(a.salt))fail('اطلاعات هویت، مجوز یا گواه رمز ناقص یا نامعتبر است.');
  const existing=state.accounts.find(x=>x.username===a.username||x.member_id===a.member_id);
  if(existing){const conflict=existing.username!==a.username||existing.member_id!==a.member_id;if(conflict)conflicts.push(a.username+': تضاد شناسه');items.push({username:a.username,member_id:a.member_id,name:m.name,status:conflict?'conflict':'preserved',permissions});continue}
  if(state.members.some(x=>x.email===a.member_id)){conflicts.push(a.username+': هویت مقصد از قبل وجود دارد');continue}
  items.push({username:a.username,member_id:a.member_id,name:m.name,status:'create',permissions});
  queries.push({sql:'INSERT INTO staff_members(email,user_id,name,role,active) SELECT ?,?,?,?,? WHERE changes()=1',args:[m.email,m.user_id||null,m.name,m.role,m.active]});
  queries.push({sql:'INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at,org_roles,org_proposed_roles,org_mode,scientific_qualified,org_revision) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE changes()=1',args:[a.username,a.member_id,a.password_hash,a.salt,a.must_change,JSON.stringify(permissions),a.updated_at,JSON.stringify(roles),JSON.stringify(proposed),a.org_mode,a.scientific_qualified,a.org_revision]});
  queries.push({sql:'INSERT INTO staff_auth_settings(id,value) SELECT ?,? WHERE changes()=1',args:['account-transfer-credential:'+a.username,JSON.stringify({status:'unverified-source-pepper',source_project_id:manifest.source_project_id})]});
 }
 const assignmentsSeen=new Set();
 for(const a of manifest.assignments){
  if(a.position_id==='management'||a.primary_member_id===policy.owner)fail('انتصاب مالک از بسته انتقال تغییر نمی‌کند.');
  if(typeof a.id!=='string'||!a.id||a.id.length>100||assignmentsSeen.has(a.id)||!state.positions.some(p=>p.id===a.position_id&&p.active===1&&Object.values(policy.roles).includes(p.code))||a.scope_type!=='institute'||a.scope_id!==''||![0,1].includes(a.active)||![0,1].includes(a.use_substitute)||!Number.isSafeInteger(a.revision)||a.revision<0||!memberIds.has(a.primary_member_id)||a.substitute_member_id&&!memberIds.has(a.substitute_member_id))fail('انتصاب معتبر و قابل اتصال نیست.');
  assignmentsSeen.add(a.id);
  const primary=manifest.accounts.find(x=>x.member_id===a.primary_member_id),position=state.positions.find(p=>p.id===a.position_id);
  if(!primary||policy.roles[primary.username]!==position.code)fail('انتصاب با نقش تأییدشده حساب مبدأ تطابق ندارد.');
  const old=state.assignments.find(x=>x.id===a.id||x.position_id===a.position_id&&x.scope_type===a.scope_type&&x.scope_id===a.scope_id);
  if(old){if(['position_id','primary_member_id','substitute_member_id','use_substitute','active'].some(k=>old[k]!==a[k]))conflicts.push(a.position_id+': انتصاب مقصد متفاوت است');continue}
  queries.push({sql:'INSERT INTO workflow_position_assignments(id,position_id,scope_type,scope_id,primary_member_id,substitute_member_id,use_substitute,active,revision,created_by,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE changes()=1',args:[a.id,a.position_id,a.scope_type,a.scope_id,a.primary_member_id,a.substitute_member_id,a.use_substitute,a.active,a.revision,a.created_by,a.created_at,a.updated_at]});
 }
 return {queries,items,conflicts,create:items.filter(i=>i.status==='create').length,preserved:items.filter(i=>i.status==='preserved').length,credentialsNeedVerification:items.filter(i=>i.status==='create').length};
}

// Offline bridge for an explicitly authorized database operator. The same plan
// is used by the owner API. SQL output is private; never include it in logs/Git.
export function accountTransferPostgresSQL(plan,{checksum,actor,at}){
 if(!/^[a-f0-9]{64}$/.test(checksum)||plan.conflicts.length||!plan.create)throw Error('No conflict-free transfer plan.');
 const literal=value=>value===null?'NULL':typeof value==='number'?String(value):"E'"+String(value).replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";
 const marker='staff-account-transfer:'+checksum;
 const queries=[{sql:'INSERT INTO staff_auth_settings(id,value) VALUES(?,?) ON CONFLICT(id) DO NOTHING',args:[marker,JSON.stringify({source:accountTransferSource,at,actor,count:plan.create})]},...plan.queries,{sql:"INSERT INTO staff_events(id,record_id,actor,action,body,created_at) VALUES(?,'auth',?,'staff-accounts-transferred',?,?)",args:[marker,actor,JSON.stringify({checksum,source:accountTransferSource,usernames:plan.items.filter(i=>i.status==='create').map(i=>i.username),owner_unchanged:true,passwords_or_hashes_logged:false}),at]}];
 const statements=queries.map((q,i)=>postgresQuery(q.sql,q.args,'_changed').replace(/\$(\d+)/g,(_,n)=>literal(q.args[Number(n)-1]))+'; GET DIAGNOSTICS _changed = ROW_COUNT;'+(i===0?' IF _changed=0 THEN RETURN; END IF;':''));
 let delimiter='$synapse_transfer$';while(statements.some(s=>s.includes(delimiter)))delimiter=delimiter.slice(0,-1)+'x$';
 return `BEGIN; SET LOCAL search_path TO pg_catalog,synapse; SELECT pg_advisory_xact_lock(800214613052); DO ${delimiter} DECLARE _changed bigint:=0; _owner jsonb; BEGIN SELECT to_jsonb(a)||jsonb_build_object('member',to_jsonb(m)) INTO _owner FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id WHERE a.username='owner'; IF _owner IS NULL THEN RAISE EXCEPTION 'Existing owner required'; END IF; ${statements.join('\n')} IF _owner IS DISTINCT FROM (SELECT to_jsonb(a)||jsonb_build_object('member',to_jsonb(m)) FROM staff_accounts a JOIN staff_members m ON m.email=a.member_id WHERE a.username='owner') THEN RAISE EXCEPTION 'Owner changed'; END IF; END ${delimiter}; COMMIT; SELECT count(*) AS account_count FROM synapse.staff_accounts;`;
}
