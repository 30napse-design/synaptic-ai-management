import {env} from 'cloudflare:workers';
import {mkdir,writeFile,readFile,unlink,realpath} from 'node:fs/promises';
import {dirname,isAbsolute,resolve,sep} from 'node:path';
/** Private storage is not inside the web root or a deployment release directory. */
async function privatePath(key:string){
 const root=process.env.SYNAPSE_PRIVATE_UPLOAD_DIR||'';
 if(!root||!isAbsolute(root))throw Object.assign(new Error('مسیر امن ذخیره فایل در Hostinger هنوز تنظیم نشده است.'),{status:503});
 if(!/^ticket-support\/[a-zA-Z0-9_-]{10,160}\/[a-f0-9-]{36}$/.test(key))throw Object.assign(new Error('شناسه مسیر فایل نامعتبر است'),{status:400});
 await mkdir(root,{recursive:true,mode:0o700});
 const real=await realpath(root),cwd=await realpath(process.cwd());
 if(real===cwd||real.startsWith(cwd+sep)||real.split(sep).some(part=>['public','public_html','www','htdocs'].includes(part))||real==='/tmp')throw Object.assign(new Error('محل فایل نباید داخل پوشه عمومی سایت یا محل انتشار برنامه باشد'),{status:503});
 const file=resolve(real,key);
 if(!file.startsWith(real+sep))throw Object.assign(new Error('مسیر فایل نامعتبر است'),{status:400});
 return file;
}
export async function privateTicketPut(key:string,bytes:Uint8Array){
 if(env.BUCKET){await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});return;}
 const file=await privatePath(key);await mkdir(dirname(file),{recursive:true,mode:0o700});await writeFile(file,bytes,{flag:'wx',mode:0o600});
}
export async function privateTicketGet(key:string){
 if(env.BUCKET){const o=await env.BUCKET.get(key);return o?new Uint8Array(await o.arrayBuffer()):null;}
 try{return await readFile(await privatePath(key))}catch(e:any){if(e.code==='ENOENT')return null;throw e}
}
export async function privateTicketDelete(key:string){
 if(env.BUCKET){await env.BUCKET.delete(key);return;}
 try{await unlink(await privatePath(key))}catch(e:any){if(e.code!=='ENOENT')throw e}
}
