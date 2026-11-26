import {json} from '../../../../lib/staff-server';
import {OWNER} from '../../../../lib/staff-policy';
import {validTicketEntry} from '../../../../lib/ticket-support-policy';
import {submitSupportTicket} from '../../../../lib/ticket-support-submit';
import {publicSupportLimit,publicSupportRecord,supportPublicBody,supportUuid,verifyPublicSupport} from '../../../../lib/public-support';
import {maxSupportDescriptionWords,supportDescriptionWordCount} from '../../../../lib/support-description';
import {normalizeIranPhone} from '../../../../lib/unified-intake-routing';

export const dynamic='force-dynamic';

export async function POST(req:Request){
 try{
  const body=await supportPublicBody(req);
  if(body?.action==='track'){
   const code=String(body.code||'').trim();
   if(!supportUuid.test(code))return json({error:'کد پیگیری معتبر نیست.'},400);
   await publicSupportLimit('track','all',240);
   const ticket=await publicSupportRecord(code);
   if(!ticket)return json({error:'درخواستی با این کد پیدا نشد.'},404);
   const status=['closed','done'].includes(ticket.request_state)||ticket.status==='closed'?'بسته‌شده':
    ticket.request_state.startsWith('waiting_')||ticket.status==='waiting'?'در انتظار پاسخ':'در حال بررسی';
   return Response.json({ok:true,status},{headers:{'Cache-Control':'no-store'}});
  }
  const entry={...body,source:'site',title:'',due:''};
  if(!validTicketEntry(entry)||!entry.description.trim()||typeof entry.requestKey!=='string'||!supportUuid.test(entry.requestKey)){
   return json({error:'اطلاعات درخواست معتبر نیست.'},400);
  }
  if(supportDescriptionWordCount(entry.description)>maxSupportDescriptionWords){
   return json({error:'شرح درخواست حداکثر ۱٬۰۰۰ کلمه باشد.'},400);
  }
  const form=body.form;
  if(form!==undefined){
   return json({error:'این فرم فعلاً فعال نیست.'},400);
  }
  await verifyPublicSupport(body.turnstileToken);
  await publicSupportLimit('submit',normalizeIranPhone(entry.phone),8);
  return Response.json(await submitSupportTicket({email:OWNER,manager:true,name:'مرکز پشتیبانی پژوهشگر'},entry,true),{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const failure=error as {status?:number;message?:string};
  return json({error:failure.status?failure.message:'انجام درخواست ممکن نشد.'},failure.status||500);
 }
}
