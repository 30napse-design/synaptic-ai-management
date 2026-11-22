// Actual ingestion code and production adapter; synthetic PostgreSQL only.
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readdir,readFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createBinding} from '../runtime/postgres.mjs';
const root=process.cwd(),database=new PGlite(),require=createRequire(import.meta.url);
const esbuildName=(await readdir('node_modules/.pnpm')).find(f=>f.startsWith('esbuild@'));
const {build}=require(join(root,'node_modules/.pnpm',esbuildName,'node_modules/esbuild'));
await mkdir('.sites-runtime',{recursive:true});const dir=await mkdtemp(join(root,'.sites-runtime/operations-sync-'));
const pool={async connect(){return {release(){},async query(q,args=[]){const sql=typeof q==='string'?q:q.text,parameters=typeof q==='string'?args:q.values;const result=await database.query(sql,parameters);return {...result,command:sql.trim().split(/\s/)[0].toUpperCase(),rowCount:result.affectedRows??result.rows.length,rows:q.rowMode==='array'?result.rows.map(r=>result.fields.map(f=>r[f.name])):result.rows}}}}};
const db=createBinding(pool);globalThis.__historyTransferEnv={DB:db};
try{
 await database.exec('CREATE SCHEMA synapse; SET search_path TO synapse,pg_catalog');for(const f of (await readdir('runtime/postgres')).filter(f=>f.endsWith('.sql')).sort())await database.exec(await readFile('runtime/postgres/'+f,'utf8'));
 await build({stdin:{contents:"export {ingest} from './lib/input-sources';",resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:join(dir,'ingest.mjs'),logLevel:'silent',plugins:[{name:'history-env',setup(b){b.onResolve({filter:/^cloudflare:workers$|^next\/(headers|navigation)$/},a=>({path:a.path,namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='cloudflare:workers'?'export const env=globalThis.__historyTransferEnv;':a.path==='next/navigation'?'export function redirect(){throw Error("Unexpected redirect")}':'export async function headers(){return new Headers()}export async function cookies(){return {get(){return undefined}}}'}))}}]});
 const {ingest}=await import(pathToFileURL(join(dir,'ingest.mjs')).href);let checks=0;
 for(const kind of ['gmail','phone']){
  const gmail=kind==='gmail',s={id:gmail?'gmail-1':'incoming-calls',enabled:true,revision:1,method:gmail?'gmail_oauth':'google_sheets',channel:kind,address:gmail?'synapticsite@gmail.com':'',notBefore:'2026-11-01',defaultDueDays:1};
  await db.prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?)').bind('input-source:'+s.id,JSON.stringify(s)).run();
  const key=gmail?'gmail:synapticsite:historical-only':'calls:incoming:synthetic-sheet:1405/08/30:1:original-key';
  await db.prepare("INSERT INTO ops_items(id,source_key,category,subtype,title,source_body,phone,source_type,assignee,status,resolution,created_by,created_at,updated_at) VALUES(?,?,'customers','support','Original title','Original source','09123456789',?,'staff:customer','doing','Human notes','synthetic-owner','2026-11-21','2026-11-21')").bind(kind,key,gmail?'gmail':'incoming').run();
  const event={eventId:'historical-only',at:'2026-11-21T00:00:00Z',title:'Provider wording differs',body:'Updated provider body',phone:'09123456789',...(gmail?{}:{legacyCall:{sheet:'synthetic-sheet',marker:'1405/08/30',sequence:1,phone:'09123456789',name:'Synthetic caller'}})};
  for(let i=0;i<2;i++){const r=await ingest(s,[event]);assert.equal(r.results[0].id,kind);assert.equal(r.results[0].replayed,true);checks+=2}
  const saved=await db.prepare('SELECT status,resolution,assignee,source_body FROM ops_items WHERE id=?').bind(kind).first();assert.deepEqual(saved,{status:'doing',resolution:'Human notes',assignee:'staff:customer',source_body:'Original source'});checks++;
 }
 assert.equal((await db.prepare('SELECT count(*) n FROM ops_items').first()).n,2);assert.equal((await db.prepare('SELECT count(*) n FROM ops_communications').first()).n,0);assert.equal((await db.prepare('SELECT count(*) n FROM staff_records').first()).n,0);checks+=3;
 console.log('PASS incremental history replay: '+checks+' checks; real Gmail/legacy Sheets ingestion preserves IDs and human edits with zero duplicate requests, communications or tasks. No provider API called.');
}finally{delete globalThis.__historyTransferEnv;await database.close();await rm(dir,{recursive:true,force:true})}
