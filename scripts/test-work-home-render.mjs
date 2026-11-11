// Local isolated Worker + D1/R2; never points at a deployed Site.
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const project=process.cwd(),require=createRequire(project+'/package.json');
const dirs=await readdir(project+'/node_modules/.pnpm'),mfDir=dirs.find(s=>s.startsWith('miniflare@'));
const {Miniflare}=require(project+'/node_modules/.pnpm/'+mfDir+'/node_modules/miniflare');
const root=project+'/dist/server',paths=(await readdir(root,{recursive:true})).filter(p=>p.endsWith('.js'));
paths.sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const modules=await Promise.all(paths.map(async p=>({type:'ESModule',path:root+'/'+p,contents:await readFile(root+'/'+p,'utf8')})));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{STAFF_AUTH_PEPPER:'isolated-work-test'}});
try{const db=await mf.getD1Database('DB');for(const f of (await readdir(project+'/drizzle')).filter(p=>p.endsWith('.sql')).sort()){for(const statement of (await readFile(project+'/drizzle/'+f,'utf8')).split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run()}
 await db.prepare("INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,status,created_by,updated_at,due) VALUES(?,?,?,?,?,?,?,?,?,?)").bind('legacy-invalid','task','legacy malformed date','','ekramiihamid@gmail.com','ekramiihamid@gmail.com','done','qa','','').run();
 await db.prepare("INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,status,created_by,updated_at,due) VALUES(?,?,?,?,?,?,?,?,?,?)").bind('legacy-due','task','legacy due','','ekramiihamid@gmail.com','ekramiihamid@gmail.com','todo','qa','2026-11-11T10:00:00Z','invalid').run();
 for(const view of ['home','overview','all','board','plans','approvals']){const path=view==='home'?'/':'/staff?view='+view;const res=await mf.dispatchFetch('https://synapse.test'+path,{headers:{'oai-authenticated-user-id':'qa:owner','oai-authenticated-user-email':'ekramiihamid@gmail.com'}});const body=await res.text();assert.equal(res.status,200,path);assert.ok(!body.includes('This page couldn'),path);assert.ok(body.includes(view==='home'?'MY WORKSPACE':'SYNAPSE / WORK'),path);assert.ok(!/\d+:E\{/.test(body),path+' streamed server error');console.log('PASS SSR '+path+' with legacy invalid dates')}

}finally{await mf.dispose()}
