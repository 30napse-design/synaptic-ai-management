// Private operator CLI. No source writes, account updates or sync activation.
import {readFile,writeFile,mkdir,mkdtemp,rm,stat,chmod} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,relative} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {postgresTLSOptions} from '../runtime/postgres-tls.mjs';
import {operationsTransferPlan,readTransferTarget,insertOperationsPlan,validateOperationsSnapshot,operationsPilotSQL} from '../lib/operations-transfer.mjs';
const exec=promisify(execFile),args=process.argv.slice(2),apply=args.includes('--apply'),file=args.find(a=>!a.startsWith('--'));
if(!file||args.includes('--help')){console.log('DATABASE_URL=<secure environment> node scripts/transfer-operations-history.mjs /secure/history.json [--apply --backup-dir=/secure/backups]');process.exit(args.includes('--help')?0:1)}
if(args.includes('--prepare-pilot-sql')){
 try{
  const input=JSON.parse(await readFile(file,'utf8')),out=args.find(a=>a.startsWith('--out='))?.slice(6);
  if(!out||!relative(process.cwd(),resolve(out)).startsWith('..'))throw Error('Private output required');
  const {plan,sql}=operationsPilotSQL(input.snapshot,input.target,input.backup);
  await writeFile(out,sql,{mode:0o600,flag:'wx'});console.log(JSON.stringify({prepared:true,checksum:plan.checksum,insert:plan.counts.ops_items.insert,repeated:plan.counts.ops_items.repeated,bulk:false}));
 }catch{console.error('Pilot preparation rejected; private export, target or backup proof invalid.');process.exitCode=1}
 process.exit(process.exitCode||0);
}
let snapshot,client;
async function backup(snapshotId){
 const dirArg=args.find(a=>a.startsWith('--backup-dir='));if(!dirArg)throw Error('Private backup directory required');
 const dir=resolve(dirArg.slice('--backup-dir='.length));if(!relative(process.cwd(),dir).startsWith('..'))throw Error('Backup must be outside repository');await mkdir(dir,{recursive:true,mode:0o700});
 const archive=join(dir,'synapse-before-history-'+Date.now()+'.dump'),temp=await mkdtemp(join(tmpdir(),'synapse-pg-ca-'));
 try{
  const options=postgresTLSOptions(process.env.DATABASE_URL),url=new URL(options.connectionString);
  if(options.ssl?.rejectUnauthorized!==true)throw Error('Remote verified TLS required');
  const ca=options.ssl.ca;if(!ca)throw Error('Explicit trusted CA bundle required for pg_dump');const caPath=join(temp,'ca.pem');await writeFile(caPath,Array.isArray(ca)?ca.join('\n'):ca,{mode:0o600});
  const env={...process.env,PGHOST:url.hostname,PGPORT:url.port||'5432',PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),PGSSLMODE:'verify-full',PGSSLROOTCERT:caPath};
  // pg_dump and pg_restore versions must support the server (currently PG 17).
  // Credentials are environment-only; no URI/secret appears in process arguments.
  await exec('pg_dump',['--schema=synapse','--format=custom','--no-owner','--no-acl','--snapshot='+snapshotId,'--file='+archive],{env,maxBuffer:1024*1024});
  await chmod(archive,0o600);
  const listing=await exec('pg_restore',['--list',archive],{maxBuffer:4*1024*1024});if(!listing.stdout.includes('ops_items')||!listing.stdout.includes('staff_accounts'))throw Error('Backup archive validation failed');
  const sha256=createHash('sha256').update(await readFile(archive)).digest('hex');await writeFile(archive+'.sha256',sha256+'\n',{mode:0o600,flag:'wx'});
  // A listing validates the archive, not a full restore rehearsal. Rehearse on
  // an isolated operator-provided database before using it for disaster recovery.
  return {verified:true,sha256,archive,bytes:(await stat(archive)).size};
 }finally{await rm(temp,{recursive:true,force:true})}
}
try{
 snapshot=JSON.parse(await readFile(file,'utf8'));validateOperationsSnapshot(snapshot);
 const connection=new URL(process.env.DATABASE_URL);const ref='thayfsgrvkpbducxqdyi';
 if(connection.hostname!=='db.'+ref+'.supabase.co'&&!(connection.hostname.endsWith('.pooler.supabase.com')&&decodeURIComponent(connection.username).endsWith('.'+ref)))throw Error('Wrong destination project');
 client=new pg.Client(postgresTLSOptions(process.env.DATABASE_URL));
 await client.connect();await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');await client.query('SELECT pg_advisory_xact_lock(800214613052)');
 const target=await readTransferTarget(client),plan=operationsTransferPlan(snapshot,target);
 console.log(JSON.stringify({mode:apply?'apply':'preview',checksum:plan.checksum,counts:plan.counts,conflicts:plan.conflicts,unassigned:plan.unassigned,checkpoints:plan.checkpoints}));
 if(plan.conflicts.length)throw Error('Conflicts require valid source/dependency data; no destination row overwritten');
 if(!apply||Object.values(plan.counts).every(c=>c.insert===0)){await client.query('ROLLBACK');if(apply)console.log(JSON.stringify({ok:true,replayed:true,inserted:0}))}else{
  const snapshotId=(await client.query('SELECT pg_export_snapshot() id')).rows[0].id;
  const receipt=await backup(snapshotId);
  const before=(await client.query("SELECT md5(row_to_json(a)::text) digest FROM synapse.staff_accounts a ORDER BY username")).rows;
  const result=await insertOperationsPlan(client,snapshot,plan,receipt);
  const after=(await client.query("SELECT md5(row_to_json(a)::text) digest FROM synapse.staff_accounts a ORDER BY username")).rows;
  if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Accounts changed; aborting');
  await client.query('COMMIT');console.log(JSON.stringify({ok:true,...result,backup:{sha256:receipt.sha256,bytes:receipt.bytes}}));
 }
}catch{try{await client?.query('ROLLBACK')}catch{}console.error('History transfer stopped. Check export completeness, preview conflicts, verified TLS, backup tools and operator connection. No credential or source payload is logged.');process.exitCode=1}finally{await client?.end()}
