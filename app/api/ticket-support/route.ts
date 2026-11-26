import {submitSupportTicket} from '../../../lib/ticket-support-submit';
import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canUseOps} from '../../../lib/ops-policy';
import {limitedText} from '../../../lib/integration-store';
import {validTicketEntry} from '../../../lib/ticket-support-policy';

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
  return json(await submitSupportTicket(u,b));
 }catch(e:any){
  if(!e?.status)console.error('ticket-create failed',e);
  return json({error:e?.status?e.message:'ثبت تیکت انجام نشد.'},e?.status||500);
 }
}
