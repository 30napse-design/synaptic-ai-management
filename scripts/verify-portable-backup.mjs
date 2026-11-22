// Offline verifier for an owner-supplied export; no network, credentials or live DB writes. SQL restoration writes only to a temporary DB.
import {DatabaseSync,constants} from 'node:sqlite';
import {readFile,mkdtemp,rm,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
// Restore a private Hostinger logical DATA backup using only repository schema.
// All writes below are to in-memory PostgreSQL, never the connected project.
if(process.argv[2]==='--postgres-json'){
 const {PGlite}=await import('@electric-sql/pglite');
 const {readdir}=await import('node:fs/promises');
 const file=process.argv[3],bytes=await readFile(file),backup=JSON.parse(bytes);
 if(backup.format!=='synapse-private-logical-backup-v1'||backup.schema!=='synapse'||!backup.tables)throw Error('Invalid PostgreSQL data backup');
 const memory=new PGlite(),quote=x=>{if(!/^[a-z_][a-z0-9_]*$/.test(x))throw Error('Invalid backup identifier');return '"'+x+'"'};
 try{
  await memory.exec('CREATE SCHEMA synapse; SET search_path TO synapse,pg_catalog; CREATE TABLE synapse_migrations(name text PRIMARY KEY)');
  for(const name of (await readdir('runtime/postgres')).filter(n=>n.endsWith('.sql')).sort())await memory.exec(await readFile(path.join('runtime/postgres',name),'utf8'));
  const tables=(await memory.query("SELECT tablename FROM pg_tables WHERE schemaname='synapse'")).rows.map(r=>r.tablename);
  if(tables.some(t=>!Array.isArray(backup.tables[t])))throw Error('Backup table missing');
  await memory.exec('TRUNCATE '+tables.map(quote).join(',')+' CASCADE');
  const edges=(await memory.query("SELECT c.conrelid::regclass::text child,c.confrelid::regclass::text parent FROM pg_constraint c WHERE c.contype='f' AND c.connamespace='synapse'::regnamespace")).rows.map(r=>({child:r.child.replace('synapse.',''),parent:r.parent.replace('synapse.','')}));
  const pending=new Set(tables),done=new Set();let rows=0;
  while(pending.size){const next=[...pending].find(t=>edges.filter(e=>e.child===t&&e.parent!==t).every(e=>done.has(e.parent)));if(!next)throw Error('Cyclic backup dependencies');
   for(const row of backup.tables[next]){const keys=Object.keys(row);await memory.query('INSERT INTO '+quote(next)+' ('+keys.map(quote).join(',')+') OVERRIDING SYSTEM VALUE VALUES ('+keys.map((_,i)=>'$'+(i+1)).join(',')+')',keys.map(k=>row[k]));rows++}
   const actual=(await memory.query('SELECT * FROM '+quote(next))).rows,canonical=r=>JSON.stringify(Object.fromEntries(Object.keys(r).sort().map(k=>[k,r[k]]))),a=actual.map(canonical).sort(),b=backup.tables[next].map(canonical).sort();if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Restored backup data differs');
   pending.delete(next);done.add(next);
  }
  console.log(JSON.stringify({ok:true,format:backup.format,restored_tables:tables.length,restored_rows:rows,accounts:backup.tables.staff_accounts.length,sha256:createHash('sha256').update(bytes).digest('hex'),scope:'isolated PostgreSQL DATA restore against repository schema; excludes external storage, secrets and full hosting recovery'}));
 }catch{throw Error('Isolated PostgreSQL data restore failed; no live database changed')}finally{await memory.close()}
 process.exit(0);
}
const root=await realpath(process.argv[2]||'.'),manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
function must(v,m){if(!v)throw Error(m)}
async function local(name){must(typeof name==='string'&&!path.isAbsolute(name),'Invalid relative export path');const p=await realpath(path.resolve(root,name));must(p.startsWith(root+path.sep),'Export path escapes backup directory');return p}
const hash=b=>createHash('sha256').update(b).digest('hex');
must(manifest.schema_version===1&&manifest.snapshot_id&&manifest.exported_at&&manifest.database&&Array.isArray(manifest.objects),'Incomplete export manifest');
const databaseBytes=await readFile(await local(manifest.database.file));must(hash(databaseBytes)===manifest.database.sha256,'Database checksum mismatch');
let temp,db;try{
 if(manifest.database.format==='sqlite')db=new DatabaseSync(await local(manifest.database.file),{readOnly:true});
 else {must(manifest.database.format==='sql','Unsupported database export format');temp=await mkdtemp(path.join(os.tmpdir(),'synapse-restore-'));db=new DatabaseSync(path.join(temp,'restore.sqlite'));db.setAuthorizer((action,a,b)=>{if([constants.SQLITE_ATTACH,constants.SQLITE_DETACH].includes(action))return constants.SQLITE_DENY;if(action===constants.SQLITE_PRAGMA&&/directory|writable_schema/i.test(a||''))return constants.SQLITE_DENY;if(action===constants.SQLITE_FUNCTION&&/load_extension|writefile|readfile/i.test(b||''))return constants.SQLITE_DENY;return constants.SQLITE_OK});db.exec(databaseBytes.toString('utf8'));}
 must(db.prepare('PRAGMA integrity_check').all().every(r=>Object.values(r)[0]==='ok'),'SQLite integrity check failed');must(db.prepare('PRAGMA foreign_key_check').all().length===0,'Foreign key check failed');
 const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r=>r.name);
 must(manifest.database.row_counts&&tables.every(t=>Object.hasOwn(manifest.database.row_counts,t)),'Missing table counts');
 for(const t of tables){const q='"'+t.replaceAll('"','""')+'"';must(db.prepare('SELECT COUNT(*) n FROM '+q).get().n===manifest.database.row_counts[t],'Table count mismatch');}
 const keys=new Set();for(const o of manifest.objects){must(typeof o.object_key==='string'&&o.object_key&&!keys.has(o.object_key),'Duplicate/invalid R2 key');keys.add(o.object_key);must(o.http_metadata&&o.custom_metadata,'Missing object metadata');const b=await readFile(await local(o.file));must(b.length===o.size&&hash(b)===o.sha256,'Object checksum/size mismatch');}
 // Every object referenced in DB must appear in the supplied manifest.
 let refs=0;for(const t of tables){const q='"'+t.replaceAll('"','""')+'"',columns=db.prepare('PRAGMA table_info('+q+')').all();if(columns.some(c=>c.name==='object_key'))for(const r of db.prepare('SELECT object_key FROM '+q+" WHERE object_key IS NOT NULL AND object_key!=''").all()){must(keys.has(r.object_key),'Database references missing object');refs++;}}
 console.log(JSON.stringify({ok:true,snapshot_id:manifest.snapshot_id,tables:tables.length,objects:keys.size,referenced_objects:refs,scope:'offline supplied snapshot; completeness against live provider is not established'}));
}finally{db?.close();if(temp)await rm(temp,{recursive:true,force:true});}
