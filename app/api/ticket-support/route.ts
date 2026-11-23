import {identity,json,db,eventStmt,mutationAllowed} from '../../../lib/staff-server';
import {canUseOps} from '../../../lib/ops-policy';
import {dispatchCreate,dispatchReady} from '../../../lib/dispatch-engine';
import {validTicketEntry,ticketMetadata} from '../../../lib/ticket-support-policy';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 try{
  if(!mutationAllowed(req))return json({error:'درخواست نامعتبر است'},403);
  const u=await identity();if(!u||!canUseOps(u)||u.laboratory)return json({error:'دسترسی به ثبت تیکت ندارید'},403);
  if(Number(req.headers.get('content-length')||0)>24000)return json({error:'حجم درخواست بیش از حد مجاز است'},413);
  let b:any;try{b=await req.json()}catch{return json({error:'فرمت درخواست معتبر نیست'},400)}
  if(!validTicketEntry(b,!!u.manager))return json({error:'دسته، موضوع، اطلاعات تماس یا عنوان درخواست معتبر نیست'},400);
  if(!await dispatchReady())return json({error:'مسیریابی عملیاتی آماده نیست'},503);
  const meta=ticketMetadata(b),requestKey=String(b.requestKey||'');
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestKey))return json({error:'شناسه ثبت درخواست معتبر نیست'},400);
  const key='ticket:'+requestKey;
  // Routing remains with the existing dispatch engine and existing ops_items table.
  // No unverified user-entered reference automatically links an invoice or authorizes sending it.
  const result=await dispatchCreate(u,{
    sourceKey:key,noContentMatch:true,partyKind:'customer',direction:'inbound',
    channel:b.source==='site'?'website':'manual',isTicket:true,ticketKind:'support',
    title:(b.source==='direct'?b.title.trim():b.topic).slice(0,240),
    subtype:b.topic,sourceBody:b.description,clientName:b.clientName,phone:b.phone,
    email:b.email,reference:b.reference,organization:b.organization||'',due:b.due,
    unifiedCategory:b.category,unifiedTopic:b.topic,
    requestType:'unknown',clientKind:'unknown',intakeState:'unreviewed'
  });
  // Versioned taxonomy metadata is attached only to NEW tickets. Existing Gmail etc. unchanged.
  const id=result.id;
  const current=await db().prepare('SELECT source_labels FROM ops_items WHERE id=?').bind(id).first<any>();
  const existing=JSON.parse(current?.source_labels||'[]');
  if(result.replayed&&existing?.ticket_v){if(existing.ticket_topic_key!==meta.ticket_topic_key)return json({error:'این شناسه برای موضوع دیگری استفاده شده است'},409);return json({ok:true,id,replayed:true,source:meta.ticket_source,category:meta.ticket_category,topic:meta.ticket_topic})}
  await db().batch([
   db().prepare('UPDATE ops_items SET source_labels=? WHERE id=? AND source_key=?').bind(JSON.stringify({...existing,...meta}),id,'dispatch:'+id),
   await eventStmt(id,u.email,'ticket-taxonomy-v2',JSON.stringify({...meta,source_key:key,by:u.email}))
  ]);
  return json({ok:true,id,source:meta.ticket_source,category:meta.ticket_category,topic:meta.ticket_topic,requires_attachment_review:true});
 }catch(e:any){console.error('ticket-create failed',e);return json({error:e?.status?e.message:'ثبت تیکت انجام نشد.'},e?.status||500)}
}
