// Offline history transfer. Source rows are private data, never executable code.
import {createHash} from 'node:crypto';
export const sourceProject='appgprj_6af06be01a5481918c6578c73c9b888a';
export const transferTables={staff_members:'email',research_people:'id',workflow_position_assignments:'id',research_orders:'id',ops_items:'id',staff_records:'id',ops_communications:'id',staff_work_details:'record_id',staff_events:'id',staff_work_notifications:'id',ops_sync_runs:'id',workflow_order_links:'id',staff_work_files:'id'};
export const identifier=s=>{if(!/^[a-z_][a-z0-9_]*$/.test(s))throw Error('Invalid identifier');return '"'+s+'"'};
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same=(a,b)=>Object.keys(a).every(k=>Object.hasOwn(b,k)&&(a[k]===b[k]||(typeof a[k]==='number'&&String(a[k])===b[k])));
export function validateOperationsSnapshot(snapshot){
 if(snapshot?.format!=='synapse-operations-history-v1'||snapshot.project_id!==sourceProject||snapshot.consistent!==true||!snapshot.tables||!Number.isFinite(Date.parse(snapshot.exported_at)))throw Error('A complete, consistent source export is required');
 for(const [table,key] of Object.entries(transferTables)){
  const t=snapshot.tables[table];
  if(!t||!Array.isArray(t.rows)||!Array.isArray(t.columns)||t.count!==t.rows.length||t.complete!==true||t.truncated_values!==0||t.next_offset!==null||!t.columns.includes(key)||t.columns.some(c=>c.startsWith('_synapse_')))throw Error('Incomplete or truncated source table: '+table);
  const seen=new Set();for(const row of t.rows){if(typeof row[key]!=='string'||!row[key]||seen.has(row[key])||Object.keys(row).length!==t.columns.length||t.columns.some(c=>!Object.hasOwn(row,c))||Object.values(row).some(v=>v!==null&&!['number','string'].includes(typeof v)||typeof v==='number'&&!Number.isSafeInteger(v)))throw Error('Invalid/duplicate source row: '+table);seen.add(row[key])}
 }
 return hash(snapshot);
}
export function operationsTransferPlan(snapshot,target){
 const checksum=validateOperationsSnapshot(snapshot),conflicts=[],inserts={},counts={};
 for(const [table,key] of Object.entries(transferTables)){
  const source=snapshot.tables[table],existing=target.tables[table];if(!existing)throw Error('Target table missing: '+table);
  if(source.columns.some(c=>!existing.columns.includes(c)))throw Error('Target schema mismatch: '+table);
  const byId=new Map(existing.rows.map(r=>[r[key],r])),bySource=new Map(existing.rows.filter(r=>r.source_key).map(r=>[r.source_key,r]));inserts[table]=[];let repeated=0,preserved=0;
  for(const row of source.rows){const prior=byId.get(row[key]),alias=row.source_key&&bySource.get(row.source_key);
   const uniqueKeys=({research_people:[['create_key']],research_orders:[['create_key'],['code']],workflow_position_assignments:[['position_id','scope_type','scope_id']],workflow_order_links:[['order_id','target_type','target_id']],staff_members:[['user_id']]})[table]||[];
   if(uniqueKeys.some(keys=>keys.every(k=>row[k]!==null&&row[k]!==undefined)&&existing.rows.some(r=>r[key]!==row[key]&&keys.every(k=>r[k]===row[k])))){conflicts.push({table,id:row[key],reason:'natural-key-identity-conflict'});continue}
   if(alias&&alias[key]!==row[key]){conflicts.push({table,id:row[key],reason:'source-key-identity-conflict'});continue}if(prior){if(table==='staff_members'){preserved++;continue}if(same(row,prior))repeated++;else conflicts.push({table,id:row[key],reason:'destination-differs'});}else inserts[table].push(row)}
  counts[table]={source:source.rows.length,destination:existing.rows.length,insert:inserts[table].length,repeated,preserved};
 }
 const ids=table=>new Set([...target.tables[table].rows,...inserts[table]].map(r=>r[transferTables[table]])),ops=ids('ops_items'),records=ids('staff_records'),people=ids('research_people'),orders=ids('research_orders'),members=new Set([...target.members,...inserts.staff_members].map(m=>m.email)),positions=new Set(target.positions.map(p=>p.id));
 for(const r of inserts.staff_members)if(!r.email.startsWith('staff:')||r.role!=='employee'||![0,1].includes(r.active))conflicts.push({table:'staff_members',id:r.email,reason:'unverified-historical-identity'});
 const missing=(table,id,reason)=>conflicts.push({table,id,reason});
 const requireId=(value,collection,table,id,reason)=>{if(value&&!collection.has(value))missing(table,id,reason)};
 for(const r of snapshot.tables.workflow_position_assignments.rows){requireId(r.position_id,positions,'workflow_position_assignments',r.id,'missing-position');requireId(r.primary_member_id,members,'workflow_position_assignments',r.id,'missing-primary-member');requireId(r.substitute_member_id,members,'workflow_position_assignments',r.id,'missing-substitute-member')}
 for(const r of snapshot.tables.research_orders.rows){requireId(r.researcher_id,people,'research_orders',r.id,'missing-researcher');requireId(r.current_position_id,positions,'research_orders',r.id,'missing-position')}
 for(const r of snapshot.tables.ops_items.rows){requireId(r.assignee,members,'ops_items',r.id,'missing-staff-identity');const routing=JSON.parse(r.routing||'{}');requireId(routing.orderId,orders,'ops_items',r.id,'missing-order');requireId(routing.researcherId,people,'ops_items',r.id,'missing-researcher');requireId(routing.projectId,records,'ops_items',r.id,'missing-project');if(routing.jobId&&!target.jobIds.includes(routing.jobId))missing('ops_items',r.id,'missing-laboratory-job');if(routing.aliasOf)requireId(routing.aliasOf,ops,'ops_items',r.id,'missing-aliased-operation')}
 for(const r of snapshot.tables.staff_records.rows){requireId(r.assignee,members,'staff_records',r.id,'missing-assignee');requireId(r.reviewer,members,'staff_records',r.id,'missing-reviewer')}
 for(const r of snapshot.tables.ops_communications.rows)requireId(r.request_id,ops,'ops_communications',r.id,'missing-request');
 for(const r of snapshot.tables.staff_work_details.rows){requireId(r.record_id,records,'staff_work_details',r.record_id,'missing-task');const d=JSON.parse(r.details);requireId(d.dispatchRequest||d.manualOperationId,ops,'staff_work_details',r.record_id,'missing-request');for(const id of d.collaborators||[])requireId(id,members,'staff_work_details',r.record_id,'missing-collaborator')}
 for(const r of snapshot.tables.staff_work_notifications.rows){requireId(r.record_id,records,'staff_work_notifications',r.id,'missing-task');requireId(r.recipient,members,'staff_work_notifications',r.id,'missing-recipient')}
 for(const r of snapshot.tables.workflow_order_links.rows){requireId(r.order_id,orders,'workflow_order_links',r.id,'missing-order');const set=({operation:ops,task:records,project:records})[r.target_type];if(set)requireId(r.target_id,set,'workflow_order_links',r.id,'missing-link-target');else if(!target.externalIds?.[r.target_type]?.includes(r.target_id))missing('workflow_order_links',r.id,'unverified-link-target')}
 for(const r of snapshot.tables.staff_work_files.rows){requireId(r.record_id,records,'staff_work_files',r.id,'missing-task');if(!target.verifiedObjects?.includes(r.object_key))missing('staff_work_files',r.id,'file-bytes-not-verified')}
 const unassigned=snapshot.tables.ops_items.rows.filter(r=>!String(r.assignee||'').trim()||JSON.parse(r.routing||'{}').acceptanceNeedsAssignment===true||JSON.parse(r.routing||'{}').acceptanceNeedsAssignment===1).length;
 const checkpoints={};for(const r of snapshot.tables.ops_items.rows){const match=/^(gmail:[^:]+:|calls:incoming:)/.exec(r.source_key);if(!match)continue;const c=checkpoints[match[1]]||={count:0,lastValidSourceAt:null};c.count++;if(r.source_at&&Number.isFinite(Date.parse(r.source_at))&&Date.parse(r.source_at)<=Date.now()+300000&&(!c.lastValidSourceAt||Date.parse(r.source_at)>Date.parse(c.lastValidSourceAt)))c.lastValidSourceAt=r.source_at}
 return {checksum,conflicts,counts,inserts,unassigned,checkpoints};
}
export async function readTransferTarget(client){
 const tables={};for(const table of Object.keys(transferTables)){const columns=(await client.query('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position',['synapse',table])).rows.map(r=>r.column_name);tables[table]={columns,rows:(await client.query('SELECT * FROM synapse.'+identifier(table))).rows}}
 return {tables,members:(await client.query('SELECT email FROM synapse.staff_members')).rows,positions:(await client.query('SELECT id FROM synapse.workflow_positions')).rows,jobIds:(await client.query('SELECT id FROM synapse.laboratory_jobs')).rows.map(r=>r.id)};
}
// Caller must hold the existing runtime advisory lock and provide a validated
// backup receipt. No routing engine, notifications or follow-up jobs run here.
export async function insertOperationsPlan(client,snapshot,plan,backup){
 if(!backup?.sha256||!/^[a-f0-9]{64}$/.test(backup.sha256)||backup.verified!==true)throw Error('Verified backup required');
 if(plan.checksum!==validateOperationsSnapshot(snapshot)||plan.conflicts.length)throw Error('Transfer preflight failed');
 let inserted=0;for(const [table,key] of Object.entries(transferTables)){const columns=snapshot.tables[table].columns;if(!plan.inserts[table].length)continue;for(const row of plan.inserts[table]){await client.query('INSERT INTO synapse.'+identifier(table)+' ('+columns.map(identifier).join(',')+') VALUES ('+columns.map((_,i)=>'$'+(i+1)).join(',')+')',columns.map(c=>row[c]));const saved=(await client.query('SELECT * FROM synapse.'+identifier(table)+' WHERE '+identifier(key)+'=$1',[row[key]])).rows[0];if(!saved||!same(row,saved))throw Error('Inserted data changed: '+table);inserted++}}
 const marker='operations-history-transfer:'+plan.checksum;
 await client.query('INSERT INTO synapse.staff_auth_settings(id,value) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',[marker,JSON.stringify({source:sourceProject,at:new Date().toISOString(),counts:plan.counts,backup_sha256:backup.sha256})]);
 return {inserted,checksum:plan.checksum,counts:plan.counts};
}
