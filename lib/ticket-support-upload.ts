import {privateTicketPut,privateTicketDelete} from './ticket-private-storage';
import {db,json} from './staff-server';
const MAX_SIZE=8*1024*1024,MAX_FILES=5;
export function assert(test:any,message:string,status=400):asserts test{if(!test)throw Object.assign(new Error(message),{status})}
function mimeOf(filename:string,bytes:Uint8Array){
 const name=filename.toLowerCase();
 if(name.endsWith('.pdf')&&bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46)return 'application/pdf';
 if(name.endsWith('.png')&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(/\.jpe?g$/.test(name)&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if(name.endsWith('.docx')&&bytes[0]===0x50&&bytes[1]===0x4b&&bytes[2]===0x03&&bytes[3]===0x04)return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 return '';
}
export async function storeTicketFile(req:Request,authorize:(id:string)=>Promise<{ticket:any;actor:string}>){
 let key='';
 try{
  assert(req.headers.get('content-type')?.startsWith('multipart/form-data'),'فرمت پیوست معتبر نیست',400);
  assert(Number(req.headers.get('content-length')||0)<=MAX_SIZE+1024*1024,'حداکثر حجم پیوست ۸ مگابایت است',413);
  let bytesReceived=0;
  const bounded=req.body?.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
   transform(chunk,controller){
    bytesReceived+=chunk.byteLength;
    assert(bytesReceived<=MAX_SIZE+1024*1024,'حداکثر حجم پیوست ۸ مگابایت است',413);
    controller.enqueue(chunk);
   }
  }));
  let form:FormData;
  try{form=await new Response(bounded,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();}
  catch{
   assert(bytesReceived<=MAX_SIZE+1024*1024,'حداکثر حجم پیوست ۸ مگابایت است',413);
   assert(false,'فرمت پیوست معتبر نیست',400);
  }
  const id=String(form.get('ticket_id')||'');
  const {ticket,actor}=await authorize(id);
  const uploadKey=String(form.get('upload_key')||'');
  assert(!uploadKey||/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uploadKey),'شناسه پیوست معتبر نیست');
  const file=form.get('file');assert(file instanceof File&&file.size>0&&file.size<=MAX_SIZE,'فایل غیرخالی تا ۸ مگابایت انتخاب کنید',413);
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=mimeOf(file.name,bytes);
  assert(mime,'فقط PDF، DOCX، PNG و JPG معتبر پذیرفته می‌شود',415);
  const old=JSON.parse(ticket.attachments||'[]');
  const prior=Array.isArray(old)&&uploadKey&&old.find((a:any)=>a.upload_key===uploadKey&&a.created_by===actor);
  if(prior)return json({ok:true,id:prior.id,filename:prior.filename,review_status:prior.review_status});
  assert(Array.isArray(old)&&old.length<MAX_FILES,'حداکثر پنج پیوست مجاز است',400);
  const fileId=crypto.randomUUID(),name=file.name.replace(/[\\/\r\n]/g,'_').slice(0,180);
  key='ticket-support/'+id+'/'+fileId;
  await privateTicketPut(key,bytes);
  const meta={id:fileId,filename:name,mime,size:file.size,object_key:key,review_required:true,review_status:'pending',created_by:actor,...uploadKey?{upload_key:uploadKey}:{}};
  try{
   const result=await db().batch([
    db().prepare('UPDATE ops_items SET attachments=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify([...old,meta]),new Date().toISOString(),id,ticket.revision),
    db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,?,?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),id,actor,'ticket-file-pending-review',JSON.stringify({file_id:fileId,filename:name,mime,size:file.size}),new Date().toISOString())
   ]);
   assert(result[0].meta.changes===1,'تیکت هم‌زمان تغییر کرده است؛ دوباره بارگذاری کنید',409);
  }catch(e){await privateTicketDelete(key);throw e}
  return json({ok:true,id:fileId,filename:name,review_status:'pending'});
 }catch(e:any){return json({error:e?.status?e.message:'پیوست ذخیره نشد'},e?.status||500)}
}
