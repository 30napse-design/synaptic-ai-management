import assert from 'node:assert/strict';
import {readdir,readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {sourceProject,transferTables,operationsTransferPlan,readTransferTarget,insertOperationsPlan,validateOperationsSnapshot,operationsPilotSQL} from '../lib/operations-transfer.mjs';
const database=new PGlite();let checks=0;
const check=(fn)=>{fn();checks++};
try{
 await database.exec('CREATE SCHEMA synapse; SET search_path TO synapse,pg_catalog');
 for(const f of (await readdir('runtime/postgres')).filter(f=>f.endsWith('.sql')).sort())await database.exec(await readFile('runtime/postgres/'+f,'utf8'));
 await database.query("INSERT INTO staff_members(email,name,role) VALUES('synthetic-owner','Synthetic owner','manager'),('staff:customer','Synthetic customer','employee')");
 const tables={};for(const table of Object.keys(transferTables)){const {rows}=await database.query('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position',['synapse',table]);tables[table]={columns:rows.map(r=>r.column_name).filter(c=>!c.startsWith('_synapse_')),rows:[],count:0,complete:true,truncated_values:0,next_offset:null}}
 // Build complete, real-schema fixtures with server defaults, then roll back.
 await database.exec('BEGIN');
 await database.query("INSERT INTO ops_items(id,source_key,category,subtype,title,source_body,client_name,reference,source_type,source_at,assignee,status,resolution,created_by,created_at,updated_at) VALUES('synthetic-op','gmail:synapticsite:synthetic-message','customers','support','Synthetic request','Original full body','Synthetic client','583','gmail','2026-11-21T00:00:00Z','staff:customer','doing','Human followup','synthetic-owner','2026-11-21','2026-11-22')");
 await database.query("INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,due,priority,status,created_by,updated_at) VALUES('synthetic-task','task','Synthetic task','Keep human notes','staff:customer','synthetic-owner','2026-11-30','normal','doing','synthetic-owner','2026-11-22')");
 await database.query("INSERT INTO staff_work_details(record_id,details) VALUES('synthetic-task','{\"manualOperationId\":\"synthetic-op\",\"progress\":25,\"collaborators\":[]}')");
 await database.query("INSERT INTO ops_communications(id,request_id,source_key,direction,channel,sender,recipient,body,metadata,delivery_status,message_id,created_by,created_at) VALUES('synthetic-comm','synthetic-op','gmail:synapticsite:synthetic-message','inbound','gmail','synthetic-client','staff:customer','Full source message','{}','received','synthetic-message','synthetic-owner','2026-11-21')");
 await database.query("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) VALUES('synthetic-event','synthetic-op','staff:customer','comment','Keep original history','2026-11-22')");
 await database.query("INSERT INTO staff_work_notifications(id,recipient,record_id,body,created_at,read_at) VALUES('synthetic-notification','staff:customer','synthetic-task','Original notification','2026-11-22','2026-11-22')");
 for(const table of Object.keys(transferTables)){tables[table].rows=(await database.query('SELECT '+tables[table].columns.join(',')+' FROM '+table)).rows;tables[table].count=tables[table].rows.length}
 const snapshot={format:'synapse-operations-history-v1',project_id:sourceProject,consistent:true,exported_at:new Date().toISOString(),tables};
 await database.exec('ROLLBACK');
 const target=await readTransferTarget(database),plan=operationsTransferPlan(snapshot,target);
 check(()=>assert.equal(plan.conflicts.length,0));check(()=>assert.equal(plan.counts.ops_items.insert,1));check(()=>assert.equal(plan.unassigned,0));check(()=>assert.equal(plan.checkpoints['gmail:synapticsite:'].lastValidSourceAt,'2026-11-21T00:00:00Z'));
 const bad=structuredClone(snapshot);bad.tables.ops_items.truncated_values=1;check(()=>assert.throws(()=>validateOperationsSnapshot(bad),/truncated/));bad.tables.ops_items.truncated_values=0;bad.consistent=false;check(()=>assert.throws(()=>validateOperationsSnapshot(bad),/consistent/));
 const missing=structuredClone(target);missing.members=missing.members.filter(m=>m.email!=='staff:customer');const missingSnapshot=structuredClone(snapshot);missingSnapshot.tables.staff_members.rows=missingSnapshot.tables.staff_members.rows.filter(m=>m.email!=='staff:customer');missingSnapshot.tables.staff_members.count--;check(()=>assert.ok(operationsTransferPlan(missingSnapshot,missing).conflicts.some(c=>c.reason==='missing-staff-identity')));
 const duplicate=structuredClone(target);duplicate.tables.ops_items.rows=[{...tables.ops_items.rows[0],id:'another-id'}];check(()=>assert.ok(operationsTransferPlan(snapshot,duplicate).conflicts.some(c=>c.reason==='source-key-identity-conflict')));
 const conflict=structuredClone(target);conflict.tables.ops_items.rows=[{...tables.ops_items.rows[0],resolution:'Newer destination human decision'}];check(()=>assert.ok(operationsTransferPlan(snapshot,conflict).conflicts.some(c=>c.reason==='destination-differs')));
 await assert.rejects(insertOperationsPlan(database,snapshot,plan,null),/backup/);checks++;
 await database.exec('BEGIN');const applied=await insertOperationsPlan(database,snapshot,plan,{verified:true,sha256:'a'.repeat(64)});await database.exec('COMMIT');check(()=>assert.equal(applied.inserted,6));
 const saved=(await database.query("SELECT * FROM ops_items WHERE id='synthetic-op'")).rows[0];check(()=>assert.ok(Object.entries(tables.ops_items.rows[0]).every(([k,v])=>saved[k]===v)));
 const replay=operationsTransferPlan(snapshot,await readTransferTarget(database));check(()=>assert.equal(replay.counts.ops_items.repeated,1));check(()=>assert.ok(Object.values(replay.counts).every(c=>c.insert===0)));
 await database.exec('BEGIN');await insertOperationsPlan(database,snapshot,replay,{verified:true,sha256:'a'.repeat(64)});await database.exec('COMMIT');const notificationCount=(await database.query('SELECT count(*) n FROM staff_work_notifications')).rows[0].n;check(()=>assert.equal(notificationCount,1));
 const assigned=(await database.query("SELECT assignee FROM staff_records WHERE id='synthetic-task'")).rows[0].assignee;check(()=>assert.equal(assigned,'staff:customer'));
 const readAt=(await database.query("SELECT read_at FROM staff_work_notifications WHERE id='synthetic-notification'")).rows[0].read_at;check(()=>assert.equal(readAt,'2026-11-22'));
 const dir=await mkdtemp(join(tmpdir(),'synapse-history-export-'));
 try{
  const full=structuredClone(snapshot);full.tables.ops_items.rows[0].source_body='متن کامل '.repeat(2000);
  const setup=spawnSync('python3',['-c',`import json,sqlite3,sys
s=json.load(sys.stdin);c=sqlite3.connect(sys.argv[1])
for t,v in s['tables'].items():
 cols=v['columns'];typ=lambda k:'INTEGER' if any(isinstance(r[k],int) for r in v['rows']) else 'TEXT'
 c.execute('CREATE TABLE "'+t+'" ('+','.join('"'+k+'" '+typ(k) for k in cols)+')')
 for r in v['rows']:c.execute('INSERT INTO "'+t+'" VALUES ('+','.join('?' for _ in cols)+')',[r[k] for k in cols])
c.commit();c.close()`,join(dir,'source.sqlite')],{input:JSON.stringify(full),encoding:'utf8'});assert.equal(setup.status,0,setup.stderr);
  const exported=spawnSync('python3',['scripts/export-operations-snapshot.py',join(dir,'source.sqlite'),join(dir,'history.json')],{encoding:'utf8'});assert.equal(exported.status,0,exported.stderr);
  const received=JSON.parse(await readFile(join(dir,'history.json'),'utf8'));check(()=>assert.ok(validateOperationsSnapshot(received)));check(()=>assert.equal(received.tables.ops_items.rows[0].source_body,full.tables.ops_items.rows[0].source_body));
 }finally{await rm(dir,{recursive:true,force:true})}
 const pilot=structuredClone(snapshot);pilot.scope='verified-pilot';for(const t of Object.keys(transferTables)){pilot.tables[t].rows=[];pilot.tables[t].count=0}
 const pilotRow={...snapshot.tables.ops_items.rows[0],id:'synthetic-pilot',source_key:'calls:incoming:synthetic-pilot',assignee:'',routing:'{}',access_scope:'',manager_only:0,source_body:"Synthetic quote ' slash \\ $operations_pilot$"};pilot.tables.ops_items.rows=[pilotRow];pilot.tables.ops_items.count=1;
 const pilotTarget=await readTransferTarget(database),receipt={verified:true,sha256:'b'.repeat(64)},sql=operationsPilotSQL(pilot,pilotTarget,receipt).sql;
 await database.exec(sql);await database.exec(sql);
 const pilotSaved=(await database.query("SELECT * FROM ops_items WHERE id='synthetic-pilot'")).rows;check(()=>assert.equal(pilotSaved.length,1));check(()=>assert.equal(pilotSaved[0].source_body,pilotRow.source_body));check(()=>assert.equal(pilotSaved[0].assignee,''));check(()=>assert.throws(()=>operationsPilotSQL({...pilot,scope:'full'},pilotTarget,receipt)));check(()=>assert.throws(()=>operationsPilotSQL(pilot,pilotTarget,null)));
 console.log('PASS operations transfer: '+checks+' isolated PostgreSQL checks; full original rows, source keys, invoice reference, human followup, task links and notification read state preserved; no live data changed.');
}finally{await database.close()}
