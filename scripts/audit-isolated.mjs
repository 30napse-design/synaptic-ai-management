import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const dir='audit-results';
mkdirSync(dir,{recursive:true});
if(process.env.SYNAPSE_ISOLATED_AUDIT!=='1') throw new Error('Use isolated CI only; no production credentials');
const allowed=['PATH','HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','TZ','SYSTEMROOT'];
const env=Object.fromEntries(allowed.filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
env.CI='true';env.NODE_ENV='test';env.TZ='UTC';
const files=readdirSync('tests').sort();
const results=[];
for(const file of files){
 const python=file.endsWith('.test.py'),node=file.endsWith('.test.mjs');
 if(!python&&!node){results.push({file,status:'deferred',reason:'Runtime harness or helper requires separate fixture review'});continue;}
 const start=Date.now();
 const r=spawnSync(python?'python3':process.execPath,python?['tests/'+file]:['--test','tests/'+file],{env,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 const output=(r.stdout||'')+'\n'+(r.stderr||'')+(r.error?'\n'+r.error.message:'');
 writeFileSync(join(dir,file+'.log'),output);
 const status=r.status===0?'passed':'failed';
 results.push({file,status,exit:r.status,durationMs:Date.now()-start,log:file+'.log'});
 console.log(status+' '+file);
 if(status==='failed') console.log(output.slice(-18000));
}
const counts=Object.fromEntries(['passed','failed','deferred'].map(s=>[s,results.filter(r=>r.status===s).length]));
writeFileSync(join(dir,'summary.json'),JSON.stringify({counts,results},null,2));
writeFileSync(join(dir,'summary.md'),'# Isolated audit\n\n'+JSON.stringify(counts)+'\n\n| File | Result |\n|---|---|\n'+results.map(r=>'| '+r.file+' | '+r.status+' |').join('\n')+'\n');
console.log(JSON.stringify(counts));if(counts.failed)process.exitCode=1;
