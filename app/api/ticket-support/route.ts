import {normalizeIranPhone} from '../../../lib/unified-intake-routing';
import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {digest} from '../../../lib/staff-auth';
import {canUseOps} from '../../../lib/ops-policy';
import {dispatchCreate} from '../../../lib/dispatch-engine';
import {limitedText} from '../../../lib/integration-store';
import {validTicketEntry,ticketMetadata} from '../../../lib/ticket-support-policy';

export const dynamic='force-dynamic';

export async function POST(req:Request){
 try{
  if(!mutationAllowed(req))return json({error:'درخواست نامعتبر است'},403);
  const u=await identity();
  if(!u||!canUseOps(u)||u.laboratory)return json({error:'دسترسی به ثبت تیکت ندارید'},403);
  const raw=await limitedText(req,128*1024);
  let b:unknown;
  try{b=JSON.parse(raw)}catch{return json({error:'فرمت درخواست معتبر نیست'},400)}
  if(!validTicketEntry(b,!!u.manager))return json({error:'دسته، موضوع، اطلاعات تماس یا عنوان درخواست معتبر نیست'},400);
  if(typeof b.requestKey!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.requestKey)){
   return json({error:'شناسه ثبت درخواست معتبر نیست'},400);
  }
  const labels=ticketMetadata(b);
  const entry={
   sourceKey:'ticket:'+b.requestKey.toLowerCase(),noContentMatch:true,partyKind:'customer',direction:'inbound',
   channel:b.source==='site'?'website':'manual',isTicket:true,ticketKind:'support',
   title:(b.source==='direct'?b.title.trim():b.topic).slice(0,240),
   subtype:b.topic,sourceBody:b.description.trim(),clientName:b.clientName.trim(),phone:normalizeIranPhone(b.phone),
   email:b.email.trim(),reference:b.reference.trim(),organization:b.organization?.trim()||'',due:b.due,
   unifiedCategory:b.category,unifiedTopic:b.topic,requestType:'unknown',clientKind:'unknown',intakeState:'unreviewed'
  };
  const fingerprint=await digest(JSON.stringify(entry));
  const result=await dispatchCreate(u,entry,false,'',{labels,fingerprint});
  return json({
   ok:true,id:result.id,trackingCode:result.id,replayed:result.replayed,
   source:labels.ticket_source,category:labels.ticket_category,topic:labels.ticket_topic,requires_attachment_review:true
  });
 }catch(e:any){
  if(!e?.status)console.error('ticket-create failed',e);
  return json({error:e?.status?e.message:'ثبت تیکت انجام نشد.'},e?.status||500);
 }
}
