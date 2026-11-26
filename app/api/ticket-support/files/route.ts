import {assert,storeTicketFile} from '../../../../lib/ticket-support-upload';
import {privateTicketGet} from '../../../../lib/ticket-private-storage';
import {identity,db,json} from '../../../../lib/staff-server';
import {requestOrigin} from '../../../../lib/request-origin';
import {canSeeOps} from '../../../../lib/ops-policy';
export const dynamic='force-dynamic';
async function record(user:any,id:string){
 const r=await db().prepare('SELECT * FROM ops_items WHERE id=?').bind(id).first<any>();
 assert(r&&canSeeOps(user,r),'تیکت پیدا نشد یا دسترسی ندارید',404);
 const meta=JSON.parse(r.source_labels||'[]');
 assert([1,2].includes(Number(meta?.ticket_v)),'این مسیر فقط برای تیکت‌های نسخه‌دار است',400);
 return r;
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==requestOrigin(req))return json({error:'درخواست نامعتبر'},403);
 const u=await identity();
 if(!u||u.laboratory)return json({error:'دسترسی ندارید'},403);
 return storeTicketFile(req,async id=>{
  const ticket=await record(u,id);
  assert(ticket.created_by===u.email||u.manager,'فقط ثبت‌کننده یا مدیریت می‌تواند پیوست اضافه کند',403);
  return {ticket,actor:u.email};
 });
}
export async function GET(req:Request){
 try{
  const u=await identity();assert(u&&!u.laboratory,'دسترسی ندارید',403);
  const url=new URL(req.url),r=await record(u,url.searchParams.get('ticket_id')||'');
  const attachments=JSON.parse(r.attachments||'[]');
  const file=attachments.find((a:any)=>a.id===url.searchParams.get('file_id'));
  assert(file,'فایل پیدا نشد',404);
  assert(u.manager||file.review_status==='approved','این پیوست تا بررسی امنیتی فقط برای مدیریت قابل دریافت است',403);
  const object=await privateTicketGet(file.object_key);assert(object,'فایل در فضای خصوصی پیدا نشد',404);
  return new Response(object,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.filename),'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch(e:any){return json({error:e?.status?e.message:'دریافت پیوست انجام نشد'},e?.status||500)}
}
