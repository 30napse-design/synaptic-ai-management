import {requestOrigin} from '../../../../lib/request-origin';
import {env} from 'cloudflare:workers';
import {db,identity,json} from '../../../../lib/staff-server';
import {digest} from '../../../../lib/staff-auth';

const max=2*1024*1024;
const standalone=process.env.SYNAPSE_STANDALONE_BUILD==='1';
const keyFor=async(email:string)=>'profile-avatar/'+await digest(email);

function imageType(b:Uint8Array){
 if(b.length>=24&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v)){
  const d=new DataView(b.buffer,b.byteOffset,b.byteLength);
  if(!d.getUint32(16)||!d.getUint32(20)||d.getUint32(16)>4096||d.getUint32(20)>4096)return '';
  return 'image/png';
 }
 if(b.length>=4&&b[0]===255&&b[1]===216&&b[2]===255&&b[b.length-2]===255&&b[b.length-1]===217)return 'image/jpeg';
 return '';
}
const imageHeaders=(mime:string)=>({'Content-Type':mime,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",'Cache-Control':'private,no-store','Vary':'Cookie'});

export async function GET(){
 const u=await identity();
 if(!u)return json({error:'ابتدا وارد شوید'},401);
 try{
  if(standalone){
   const photo=await db().prepare('SELECT mime_type,image_data FROM staff_profile_avatars WHERE member_id=?').bind(u.email).first<any>();
   if(!photo)return new Response(null,{status:404,headers:{'Cache-Control':'private,no-store'}});
   return new Response(new Uint8Array(photo.image_data),{headers:imageHeaders(photo.mime_type)});
  }
  const object=await env.BUCKET?.get(await keyFor(u.email));
  if(!object)return new Response(null,{status:404,headers:{'Cache-Control':'private,no-store'}});
  return new Response(object.body,{headers:imageHeaders(object.httpMetadata?.contentType||'application/octet-stream')});
 }catch(e){console.error('Profile avatar read failure',e);return json({error:'خواندن تصویر حساب ممکن نشد'},503)}
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==requestOrigin(req))return json({error:'درخواست نامعتبر'},403);
 const u=await identity();
 if(!u)return json({error:'ابتدا وارد شوید'},401);
 if(!standalone&&!env.BUCKET)return json({error:'فضای خصوصی فایل در دسترس نیست'},503);
 if(!req.headers.get('content-type')?.startsWith('multipart/form-data'))return json({error:'فایل تصویر انتخاب کنید'},400);
 if(Number(req.headers.get('content-length')||0)>max+20000)return json({error:'حداکثر ۲ مگابایت'},413);
 try{
  const f=(await req.formData()).get('file');
  if(!(f instanceof File)||f.size<1||f.size>max)return json({error:'تصویر تا ۲ مگابایت انتخاب کنید'},400);
  const bytes=new Uint8Array(await f.arrayBuffer()),mime=imageType(bytes);
  if(!mime||mime!==f.type)return json({error:'فقط تصویر معتبر PNG یا JPEG پذیرفته می‌شود'},400);
  if(standalone){
   await db().prepare(`INSERT INTO staff_profile_avatars(member_id,mime_type,image_data,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(member_id) DO UPDATE SET mime_type=excluded.mime_type,image_data=excluded.image_data,updated_at=CURRENT_TIMESTAMP`).bind(u.email,mime,bytes).run();
  }else{
   await env.BUCKET!.put(await keyFor(u.email),bytes,{httpMetadata:{contentType:mime},customMetadata:{owner:u.email,updatedAt:new Date().toISOString()}});
  }
  return json({ok:true});
 }catch(e){console.error('Profile avatar write failure',e);return json({error:'ذخیره تصویر انجام نشد؛ اتصال ذخیره‌سازی را بررسی کنید'},503)}
}
