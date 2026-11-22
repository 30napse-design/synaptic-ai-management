// Actual route handlers and PostgreSQL adapter against an isolated in-memory
// PostgreSQL engine. Next's request-scoped headers/cookies are contract fixtures;
// this does not certify a browser session or the live Hostinger database.
import assert from 'node:assert/strict';
import {AsyncLocalStorage} from 'node:async_hooks';
import {createRequire} from 'node:module';
import {readdir,readFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {PGlite} from '@electric-sql/pglite';
import {createBinding} from '../runtime/postgres.mjs';

const project=process.cwd(),require=createRequire(import.meta.url);
const esbuildDirectory=(await readdir(join(project,'node_modules/.pnpm'))).find(name=>name.startsWith('esbuild@'));
const {build}=require(join(project,'node_modules/.pnpm',esbuildDirectory,'node_modules/esbuild'));
await mkdir(join(project,'.sites-runtime'),{recursive:true});
const directory=await mkdtemp(join(project,'.sites-runtime/hostinger-auth-'));
const database=new PGlite(),requests=new AsyncLocalStorage();
let releaseQueue=Promise.resolve(),checks=0;
const pool={async connect(){const prior=releaseQueue;let release;releaseQueue=new Promise(resolve=>release=resolve);await prior;return {release,async query(query,parameters=[]){const text=typeof query==='string'?query:query.text,values=typeof query==='string'?parameters:query.values;const result=await database.query(text,values);const rows=query.rowMode==='array'?result.rows.map(row=>result.fields.map(f=>row[f.name])):result.rows;return {...result,rows,command:text.trim().split(/\s/)[0].toUpperCase(),rowCount:result.affectedRows??result.rows.length}}}}};
const db=createBinding(pool);
globalThis.__synapseAuthEnv={DB:db,STAFF_AUTH_PEPPER:'SYNTHETIC-ISOLATED-PEPPER-000000000000',STAFF_ACCOUNT_SETUP_TOKEN:'SYNTHETIC-ISOLATED-SETUP-000000000000'};
globalThis.__synapseAuthRequests=requests;
process.env.SYNAPSE_STANDALONE_BUILD='1';process.env.SYNAPSE_PUBLIC_ORIGIN='https://hostinger.test';
try{
 await database.exec('CREATE SCHEMA synapse; SET search_path TO synapse, pg_catalog;');
 for(const file of (await readdir(join(project,'runtime/postgres'))).filter(f=>f.endsWith('.sql')).sort())await database.exec(await readFile(join(project,'runtime/postgres',file),'utf8'));
 await build({stdin:{contents:`export {POST as login} from './app/api/auth/login/route';export {POST as provision} from './app/api/auth/provision/route';export {POST as changePassword} from './app/api/auth/password/route';export {POST as logout} from './app/api/auth/logout/route';export {GET as accounts} from './app/api/auth/accounts/route';export {GET as legacySignIn} from './app/signin-with-chatgpt/route';export {default as LoginPage} from './app/login/page';export {identity} from './lib/staff-server';export {localSession,passwordHash} from './lib/staff-auth';export {workspaceUser} from './lib/workspace-user';export {standaloneOwnerSetupAvailable as setupAvailable} from './lib/standalone-owner-setup';export {safeAuthReturnPath} from './lib/auth-redirect';export {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from './app/chatgpt-auth';`,resolveDir:project,loader:'ts'},bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:join(directory,'handlers.mjs'),logLevel:'silent',plugins:[{name:'request-contracts',setup(b){
  b.onResolve({filter:/^cloudflare:workers$|^next\/headers$|^next\/navigation$/},args=>({path:args.path,namespace:'request-fixture'}));
  b.onLoad({filter:/.*/,namespace:'request-fixture'},args=>({contents:args.path==='cloudflare:workers'?'export const env=globalThis.__synapseAuthEnv;':args.path==='next/navigation'?`export function redirect(location){const error=new Error('Redirect');error.location=location;throw error}`:`export async function headers(){return globalThis.__synapseAuthRequests.getStore()?.headers||new Headers()}export async function cookies(){return {get(name){const raw=globalThis.__synapseAuthRequests.getStore()?.headers.get('cookie')||'';const item=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return item?{value:item.slice(name.length+1)}:undefined}}}`}));
 }}]});
 const h=await import(pathToFileURL(join(directory,'handlers.mjs')).href);
 const {renderToStaticMarkup}=await import('react-dom/server');
 const origin='https://hostinger.test';
 async function call(handler,body,options={}){const headers=new Headers({origin,'content-type':'application/json',...options.headers});if(options.cookie)headers.set('cookie',options.cookie);const req=new Request(origin+(options.path||'/api/auth/login'),{method:body===undefined?'GET':'POST',headers,...(body===undefined?{}:{body:JSON.stringify(body)})});const res=await requests.run(req,()=>handler(req));let data;try{data=await res.clone().json()}catch{data={}}checks++;return {res,data,cookie:res.headers.get('set-cookie')?.split(';')[0]}}
 async function context(cookie,fn,headers={}){return requests.run(new Request(origin,{headers:{...headers,...(cookie?{cookie}:{})}}),fn)}
 const setup={action:'initial_owner',name:'Synthetic initial owner',password:'InitialHostinger8',confirmInitialOwner:true},authorization={'x-synapse-setup':globalThis.__synapseAuthEnv.STAFF_ACCOUNT_SETUP_TOKEN};
 const savedToken=globalThis.__synapseAuthEnv.STAFF_ACCOUNT_SETUP_TOKEN;
 delete globalThis.__synapseAuthEnv.STAFF_ACCOUNT_SETUP_TOKEN;assert.equal(await h.setupAvailable(),false);assert.equal((await call(h.provision,setup,{headers:authorization})).res.status,404);globalThis.__synapseAuthEnv.STAFF_ACCOUNT_SETUP_TOKEN=savedToken;
 assert.equal(await h.setupAvailable(),true);
 const html=renderToStaticMarkup(await h.LoginPage({searchParams:Promise.resolve({})}));assert.ok(!html.includes('ورود مدیریت با ChatGPT'));assert.ok(html.includes('راه‌اندازی امن مدیر اولیه'));assert.ok(!html.includes(authorization['x-synapse-setup']));checks++;
 for(const unsafe of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','/..//evil.invalid','/%2e%2e//evil.invalid','/%2F%2Fevil.invalid','/%5cevil.invalid','/login','/login/','/signin-with-chatgpt','/api/auth/login'])assert.equal(h.safeAuthReturnPath(unsafe),'/');
 assert.equal(h.safeAuthReturnPath('/staff?view=board'),'/staff?view=board');assert.equal(h.chatGPTSignInPath('/staff'),'/login?return_to=%2Fstaff');assert.equal(h.chatGPTSignOutPath(),'/login');checks++;
 const legacy=await call(h.legacySignIn,undefined,{path:'/signin-with-chatgpt?return_to=%2Fstaff'});assert.equal(legacy.res.status,303);assert.equal(legacy.res.headers.get('location'),origin+'/login?return_to=%2Fstaff');
 assert.equal(await context('',h.getChatGPTUser,{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'ekramiihamid@gmail.com'}),null);
 assert.equal(await context('',h.identity,{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'ekramiihamid@gmail.com'}),null);checks++;
 await assert.rejects(context('',h.workspaceUser),error=>error.location==='/login');checks++;
 assert.equal((await call(h.provision,setup)).res.status,403);
 assert.equal((await call(h.provision,setup,{headers:{...authorization,origin:'https://evil.invalid'}})).res.status,403);
 assert.equal((await call(h.provision,{...setup,password:'weak'},{headers:authorization})).res.status,400);
 // Existing accounts must not be replaced by first-owner setup.
 await db.prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,updated_at) VALUES('existing','synthetic','synthetic','synthetic','then')").run();
 assert.equal((await call(h.provision,setup,{headers:authorization})).res.status,409);await db.prepare("DELETE FROM staff_accounts WHERE username='existing'").run();
 const race=await Promise.all([call(h.provision,setup,{headers:authorization}),call(h.provision,setup,{headers:authorization})]);assert.deepEqual(race.map(r=>r.res.status).sort(),[200,409]);
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM staff_accounts').first()).n,1);assert.equal(await h.setupAvailable(),false);
 assert.equal((await call(h.provision,setup,{headers:authorization})).res.status,409);
 const initial=(await db.prepare("SELECT * FROM staff_accounts WHERE username='owner'").first());assert.notEqual(initial.password_hash,setup.password);assert.equal(initial.must_change,1);
 assert.equal((await call(h.login,{username:'owner',password:'WrongPassword8'})).res.status,401);
 const logged=await call(h.login,{username:'owner',password:setup.password,returnTo:'/staff'});assert.equal(logged.res.status,200);assert.equal(logged.data.next,'/account/password');assert.match(logged.res.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Strict/);
 assert.equal(await context(logged.cookie,h.identity),null);await assert.rejects(context(logged.cookie,h.workspaceUser),error=>error.location==='/account/password');checks++;
 assert.equal((await call(h.accounts,undefined,{cookie:logged.cookie})).res.status,403);
 const changed=await call(h.changePassword,{currentPassword:setup.password,newPassword:'ChangedHostinger9'},{cookie:logged.cookie});assert.equal(changed.res.status,200);assert.notEqual(changed.cookie,logged.cookie);
 assert.equal(await context(logged.cookie,h.localSession),null);const owner=await context(changed.cookie,h.identity);assert.equal(owner.manager,true);assert.equal(owner.username,'owner');assert.equal(owner.local,true);checks++;
 assert.equal((await call(h.accounts,undefined,{cookie:changed.cookie})).res.status,200);
 const allowed=await call(h.login,{username:'owner',password:'ChangedHostinger9',returnTo:'/staff?view=board'});assert.equal(allowed.data.next,'/staff?view=board');
 const denied=await call(h.login,{username:'owner',password:'ChangedHostinger9',returnTo:'//evil.invalid'});assert.equal(denied.data.next,'/');
 // Ordinary local staff cannot acquire owner/account administration rights.
 const salt='synthetic-staff-salt',hash=await h.passwordHash('CustomerHostinger8',salt);
 await db.prepare("INSERT INTO staff_members(email,name,role) VALUES('staff:customer','Synthetic customer','employee')").run();
 await db.prepare("INSERT INTO staff_accounts(username,member_id,password_hash,salt,must_change,permissions,updated_at) VALUES('customer','staff:customer',?,?,0,'[\"people\"]','then')").bind(hash,salt).run();
 const employee=await call(h.login,{username:'customer',password:'CustomerHostinger8'});assert.equal(employee.res.status,200);assert.equal((await context(employee.cookie,h.identity)).manager,false);assert.equal((await call(h.accounts,undefined,{cookie:employee.cookie})).res.status,403);
 for(let i=0;i<7;i++){const bad=await call(h.login,{username:'nobody',password:'UnknownHostinger8'},{headers:{'cf-connecting-ip':'spoofed-'+i}});assert.equal(bad.res.status,i===6?429:401)}
 const logout=await call(h.logout,{}, {cookie:changed.cookie});assert.equal(logout.data.next,'/login');assert.match(logout.res.headers.get('set-cookie'),/Max-Age=0/);assert.equal(await context(changed.cookie,h.identity),null);
 const events=JSON.stringify((await db.prepare("SELECT body FROM staff_events WHERE action='standalone-owner-created'").all()).results);assert.ok(!events.includes(setup.password)&&!events.includes(authorization['x-synapse-setup']));
 assert.equal((await call(h.provision,setup,{headers:authorization})).res.status,429);
 delete globalThis.__synapseAuthEnv.STAFF_ACCOUNT_SETUP_TOKEN;assert.equal((await call(h.provision,setup,{headers:authorization})).res.status,404);
 console.log(`PASS Hostinger auth: ${checks} request/redirect checks using the production PostgreSQL adapter and isolated PostgreSQL; one-time guarded bootstrap, concurrent claims, login/forced password change, session rotation/logout, staff permissions, forged Sites headers, safe return paths and rate limits. No live account or Hostinger setting changed.`);
}finally{await database.close();await rm(directory,{recursive:true,force:true});delete globalThis.__synapseAuthEnv;delete globalThis.__synapseAuthRequests}
