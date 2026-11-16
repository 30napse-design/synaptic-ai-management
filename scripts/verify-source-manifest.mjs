// Verify an extracted source snapshot; no dependencies, network or runtime writes.
import {readFileSync, lstatSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifestPath=process.argv[2]||'docs/source/package2-source-manifest.json';
const manifest=JSON.parse(readFileSync(path.join(root,manifestPath),'utf8'));
let failures=0;
for(const f of manifest.files){
  const absolute=path.resolve(root,f.path);
  if(!absolute.startsWith(root)||f.path===manifestPath){console.error('Unsafe manifest entry');failures++;continue;}
  try{
    if(!lstatSync(absolute).isFile())throw Error('Expected regular source file');
    const bytes=readFileSync(absolute);
    if(bytes.length!==f.bytes||createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw Error('Checksum mismatch');
  }catch(e){console.error(f.path+': '+e.message);failures++;}
}
// A clean ZIP does not require Git. In a checkout, also detect omitted tracked files.
if(existsSync(path.join(root,'.git'))){
  const git=spawnSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'});
  if(git.status!==0){console.error('Cannot enumerate tracked files');failures++;}
  else{const listed=new Set([...manifest.files.map(f=>f.path),manifestPath]);for(const f of git.stdout.split('\0').filter(Boolean))if(!listed.has(f)){console.error('Not in manifest: '+f);failures++;}}
}
console.log(JSON.stringify({ok:failures===0,files:manifest.files.length,failures,runtimeBase:manifest.runtime_base_commit}));
process.exitCode=failures?1:0;
