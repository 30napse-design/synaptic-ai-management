// Temporary loopback preview only. Never import this fixture harness into application code.
// No production binding, data, credentials, external model or service is used.
import {createRequire} from 'node:module';
import {readFile,readdir,stat} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import http from 'node:http';
const project=process.cwd(),require=createRequire(project+'/package.json');
const mfDir=(await readdir(project+'/node_modules/.pnpm')).find(x=>x.startsWith('miniflare@'));
const {Miniflare}=require(project+'/node_modules/.pnpm/'+mfDir+'/node_modules/miniflare');
const root=project+'/dist/server',files=(await readdir(root,{recursive:true})).filter(x=>x.endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const modules=await Promise.all(files.map(async p=>({type:'ESModule',path:root+'/'+p,contents:await readFile(root+'/'+p,'utf8')})));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{STAFF_AUTH_PEPPER:randomBytes(32).toString('hex')}});
const origin='http://127.0.0.1:4173',owner='ekramiihamid@gmail.com',native={'oai-authenticated-user-id':'isolated-package1-native','oai-authenticated-user-email':owner};
const password=()=>randomBytes(24).toString('base64url')+'Aa7!',credentials=new Map(),members=new Map();
const roles=[['owner','management','Institute Director'],['executive','executive_director','Executive Director'],['customer','customer_manager','Customer Manager'],['scientific','scientific_manager','Scientific Manager'],['finance','finance_manager','Finance Manager'],['research','research_manager','Research Manager'],['admin','administration_manager','Administration Manager'],['it','it_security_manager','IT & Security Manager'],['specialist','research_specialist','Research Specialist']];
async function api(url,body,headers=native){const r=await mf.dispatchFetch(origin+url,{method:body?'POST':'GET',headers:{...headers,Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'preview-'+(body?.username||'fixture')},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok)throw Error('Preview fixture '+url+': '+r.status+' '+d.error);return {r,d}}
let server;
try{
 const db=await mf.getD1Database('DB');for(const f of (await readdir(project+'/drizzle')).filter(p=>p.endsWith('.sql')).sort())for(const statement of (await readFile(project+'/drizzle/'+f,'utf8')).split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run();
 const pre=(await api('/api/auth/accounts',{action:'activation_preflight',environment_commit:'f'.repeat(40),backup_reference:'synthetic://preview-fixture-only',backup_sha256:'a'.repeat(64),restore_verified:true,restore_evidence:'Isolated synthetic data; not a production backup',confirm_environment:true})).d.id;
 const now=new Date().toISOString(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 for(const [username,role,title] of roles){
  const initial=password(),final=password(),source=username;
  if(username==='owner')await api('/api/auth/accounts',{action:'owner_login',password:initial,preflight_id:pre,confirm_owner_login:true,reason:'Synthetic preview owner only'});
  else await api('/api/auth/accounts',{action:'create',username:source,name:'آزمایشی — '+title,password:initial,roles:[role]});
  if(source!==username)await api('/api/auth/accounts',{action:'edit',username:source,new_username:username,name:'آزمایشی — '+title,confirm_identity:true,preflight_id:pre});
  const logged=await api('/api/auth/login',{username,password:initial},{}),cookie=logged.r.headers.get('set-cookie').split(';')[0];await api('/api/auth/password',{currentPassword:initial,newPassword:final},{Cookie:cookie});credentials.set(username,final);
  const member=username==='owner'?owner:'staff:'+source;members.set(username,member);
  await api('/api/operations',{action:'position_assign',position_id:role,primary_member_id:member});
  const id='preview-'+username;await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,due,status,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,'task','آزمایشی — بررسی برنامه '+title,'داده ساختگی برای بررسی بسته اول؛ هیچ پرونده واقعی در این محیط نیست.',member,owner,today,'todo',owner,now).run();
  await db.prepare('INSERT INTO staff_work_details(record_id,details) VALUES(?,?)').bind(id,JSON.stringify({scheduledDate:today,collaborators:[]})).run();
  await db.prepare('INSERT INTO staff_work_notifications(id,recipient,record_id,body,created_at) VALUES(?,?,?,?,?)').bind('notice-'+id,member,id,'آزمایشی — کار جدید در کارتابل شما',now).run();
  await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,due,status,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind('mail-'+id,'correspondence','آزمایشی — پیام داخلی '+title,'پیام مصنوعی متصل به کارتابل همین حساب',member,owner,today,'todo',owner,now).run();
 }
 if(process.argv.includes('--sample-intake-fixture')){
  const customerLogin=await api('/api/auth/login',{username:'customer',password:credentials.get('customer')},{}),customerHeaders={Cookie:customerLogin.r.headers.get('set-cookie').split(';')[0]};
  const mother=(await api('/api/lab-operations',{action:'mother_create',invoice_number:'TEST-INTAKE-583',title:'آزمایشی — پذیرش نمونه محققین',customer_name:'محقق کاملاً ساختگی',department:'پاتولوژی'},customerHeaders)).d;
  const lab=(await api('/api/laboratories',{action:'lab_save',type:'internal',name:'مجری آزمایشی بافت‌شناسی',areas:['بافت‌شناسی و پاتولوژی']})).d;
  await api('/api/lab-operations',{action:'mother_job_create',id:mother.id,revision:mother.revision,key:'preview-intake-work-order',department:'پاتولوژی',laboratory_id:lab.id,services:[{description:'بافت آزمایشی',quantity:10,unit:'قطعه'}]});
 }
 // Opt-in regression fixture for historical plain-text notes; local Miniflare only.
 if(process.argv.includes('--laboratory-center-legacy-fixture')){
  const domains=[['animal','مطالعات حیوانی'],['histology','بافت‌شناسی و پاتولوژی'],['cell-molecular','تکنیک‌های سلولی'],['protein-biochemistry','بیوشیمی'],['microbiology','میکروب‌شناسی'],['other','سایر خدمات تخصصی']];
  for(const [domain,area]of domains){const lab=(await api('/api/laboratories',{action:'lab_save',type:'internal',name:'مجری آزمایشی — '+domain,areas:[area]})).d.id;await db.prepare('INSERT INTO laboratory_jobs(id,reference,area,client,service,quantity,assignee,notes,laboratory_id,created_by,created_at,updated_at) VALUES(?,?,?,?,?,1,?,?,?,?,?,?)').bind('legacy-fixture-'+domain,'TEST-LEGACY-'+domain,area,'محقق کاملاً ساختگی','خدمت آزمایشی — '+domain,members.get('specialist'),'Historical free-text notes; not JSON',lab,owner,now,now).run();}
 }
 const types={'.js':'text/javascript','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
 const banner='<aside style="position:sticky;top:0;z-index:99999;background:#132c4b;color:white;padding:10px;font:13px sans-serif;text-align:center" dir="rtl">پیش‌نمایش بسته اول — فقط داده آزمایشی، مستقل از سایت زنده · انتخاب حساب: '+roles.map(([n])=>'<a style="color:#aeeaff;margin:5px;display:inline-block" href="/_preview/role/'+n+'">'+n+'</a>').join('')+'</aside>';
 server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,origin);
  if(url.pathname.startsWith('/_preview/role/')){const username=url.pathname.slice('/_preview/role/'.length);if(!credentials.has(username)){res.writeHead(404);res.end();return}const {r}=await api('/api/auth/login',{username,password:credentials.get(username)},{});res.writeHead(303,{'Location':'/staff?view=overview','Set-Cookie':r.headers.get('set-cookie'),'Cache-Control':'no-store'});res.end();return}
  const asset=path.resolve(project+'/dist/client','.'+decodeURIComponent(url.pathname));if(asset.startsWith(project+'/dist/client/')){try{if((await stat(asset)).isFile()){res.writeHead(200,{'Content-Type':types[path.extname(asset)]||'application/octet-stream'});res.end(await readFile(asset));return}}catch{}}
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);
  // Native identity headers are never accepted from the preview HTTP client.
  for(const key of [...headers.keys()])if(key.startsWith('oai-'))headers.delete(key);
  const response=await mf.dispatchFetch(url.href,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const out=Object.fromEntries(response.headers);delete out['content-length'];let body=Buffer.from(await response.arrayBuffer());
  if((out['content-type']||'').includes('text/html'))body=Buffer.from(body.toString().replace(/<body([^>]*)>/,'<body$1>'+banner));res.writeHead(response.status,out);res.end(body);
 }catch{res.writeHead(500);res.end('Isolated preview request failed')}});
 await new Promise(resolve=>server.listen(4173,'0.0.0.0',resolve));console.log('Package one preview ready; nine synthetic logins; passwords held in memory only.');await new Promise(()=>{});
}finally{if(server)await new Promise(resolve=>server.close(resolve));await mf.dispose()}
