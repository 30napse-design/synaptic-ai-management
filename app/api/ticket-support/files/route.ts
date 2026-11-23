import {env} from 'cloudflare:workers';
import {identity,db,json} from '../../../../lib/staff-server';
import {requestOrigin} from '../../../../lib/request-origin';
import {canSeeOps} from '../../../../lib/ops-policy';
export const dynamic='force-dynamic';
const MAX_SIZE=8*1024*1024,MAX_FILES=5;
function assert(test:any,message:string,status=400):asserts test{if(!test)throw Object.assign(new Error(message),{status})}
function mimeOf(filename:string,bytes:Uint8Array){
 const name=filename.toLowerCase();
 if(name.endsWith('.pdf')&&bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46)return 'application/pdf';
 if(name.endsWith('.png')&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(/\.jpe?g$/.test(name)&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if(name.endsWith('.docx')&&bytes[0]===0x50&&bytes[1]===0x4b&&bytes[2]===0x03&&bytes[3]===0x04)return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 return '';
}
async function record(user:any,id:string){
 const r=await db().prepare('SELECT * FROM ops_items WHERE id=?').bind(id).first<any>();
 assert(r&&canSeeOps(user,r),'تیکت پیدا نشد یا دسترسی ندارید',404);
 const meta=JSON.parse(r.source_labels||'[]');
 assert(meta?.ticket_v===1,'این مسیر فقط برای تیکت‌های نسخه جدید است',400);
 return r;
}
export async function POST(req:Request){
 let key='';
 try{
  assert(req.headers.get('origin')===requestOrigin(req),'درخواست نامعتبر',403);
  assert(req.headers.get('content-type')?.startsWith('multipart/form-data'),'فرمت پیوست معتبر نیست',400);
  assert(Number(req.headers.get('content-length')||0)<=MAX_SIZE+1024*1024,'حداکثر حجم پیوست ۸ مگابایت است',413);
  const u=await identity();assert(u&&!u.laboratory,'دسترسی ندارید',403);
  const form=await req.formData(),id=String(form.get('ticket_id')||'');
  const ticket=await record(u,id);assert(ticket.created_by===u.email||u.manager,'فقط ثبت‌کننده یا مدیریت می‌تواند پیوست اضافه کند',403);
  const file=form.get('file');assert(file instanceof File&&file.size>0&&file.size<=MAX_SIZE,'فایل غیرخالی تا ۸ مگابایت انتخاب کنید',413);
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=mimeOf(file.name,bytes);
  assert(mime,'فقط PDF، DOCX، PNG و JPG معتبر پذیرفته می‌شود',415);
  assert(env.BUCKET,'فضای خصوصی ذخیره پیوست هنوز فعال نشده است',503);
  const old=JSON.parse(ticket.attachments||'[]');assert(Array.isArray(old)&&old.length<MAX_FILES,'حداکثر پنج پیوست مجاز است',400);
  const fileId=crypto.randomUUID(),name=file.name.replace(/[\\/\r\n]/g,'_').slice(0,180);
  key='ticket-support/'+id+'/'+fileId;
  await env.BUCKET!.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
  const meta={id:fileId,filename:name,mime,size:file.size,object_key:key,review_required:true,review_status:'pending',created_by:u.email};
  try{
   const result=await db().batch([
    db().prepare('UPDATE ops_items SET attachments=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify([...old,meta]),new Date().toISOString(),id,ticket.revision),
    db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,?,?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),id,u.email,'ticket-file-pending-review',JSON.stringify({file_id:fileId,filename:name,mime,size:file.size}),new Date().toISOString())
   ]);
   assert(result[0].meta.changes===1,'تیکت هم‌زمان تغییر کرده است؛ دوباره بارگذاری کنید',409);
  }catch(e){await env.BUCKET!.delete(key);throw e}
  return json({ok:true,id:fileId,filename:name,review_status:'pending'});
 }catch(e:any){return json({error:e?.status?e.message:'پیوست ذخیره نشد'},e?.status||500)}
}
export async function GET(req:Request){
 try{
  const u=await identity();assert(u&&!u.laboratory,'دسترسی ندارید',403);
  const url=new URL(req.url),r=await record(u,url.searchParams.get('ticket_id')||'');
  const attachments=JSON.parse(r.attachments||'[]');
  const file=attachments.find((a:any)=>a.id===url.searchParams.get('file_id'));
  assert(file,'فایل پیدا نشد',404);
  assert(u.manager||file.review_status==='approved','این پیوست تا بررسی امنیتی فقط برای مدیریت قابل دریافت است',403);
  assert(env.BUCKET,'فضای فایل در دسترس نیست',503);
  const object=await env.BUCKET!.get(file.object_key);assert(object,'فایل در فضای خصوصی پیدا نشد',404);
  return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.filename),'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch(e:any){return json({error:e?.status?e.message:'دریافت پیوست انجام نشد'},e?.status||500)}
}
