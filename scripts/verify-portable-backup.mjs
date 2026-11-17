// Offline verifier for an owner-supplied export; no network, credentials or live DB writes. SQL restoration writes only to a temporary DB.
import {DatabaseSync,constants} from 'node:sqlite';
import {readFile,mkdtemp,rm,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
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
