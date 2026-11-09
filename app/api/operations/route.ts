import {canDeleteData,deletionAction} from '../../../lib/deletion-policy';
import {validCommunication} from '../../../lib/communication-policy';
import {readOperationsData} from '../../../lib/operations-data';
import {db,identity,json,mutationAllowed,eventStmt} from '../../../lib/staff-server';
import {hasAccess} from '../../../lib/auth-policy';
import {canSeeOps,categoryFor,privateSubtypes,sensitive,opsStatuses,validateOpsInput} from '../../../lib/ops-policy';
import {intakeFields,validIntake,validDue} from '../../../lib/intake-policy';
import {validOpsAssignee} from '../../../lib/intake-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){const u=await identity();if(!u)return json({error:'ابتدا وارد شوید'},401);if(!u.manager&&!['operations','calls','billing_ops','results_ops'].some(s=>hasAccess(u,s)))return json({error:'دسترسی ندارید'},403);return json(await readOperationsData(u,new URL(req.url).searchParams))}
export async function POST(req:Request){
 if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);
 const u=await identity();if(!u)return json({error:'ابتدا وارد شوید'},401);
 if(Number(req.headers.get('content-length')||0)>50000)return json({error:'حجم درخواست زیاد است'},413);
 const b:any=await req.json();if(deletionAction(b.action)&&!canDeleteData(u))return json({error:'حذف فقط برای مالک اصلی سامانه مجاز است.'},403);
 if(b.action==='create'){
  const c=categoryFor(b.subtype),direction=String(b.direction||'inbound'),channel=String(b.channel||(b.sourceType==='incoming'?'phone':'manual')),visitPurpose=String(b.visitPurpose||'');
  if(!validCommunication(direction,channel,visitPurpose))return json({error:'روش ارتباط یا موضوع مراجعه معتبر نیست'},400);
  const sourceType=channel==='phone'?'incoming':'manual',item={...b,category:c?.id,sourceType,sourceBody:String(b.sourceBody||'')};
  const f=intakeFields(b);if(!validIntake(f)||!validDue(b.due||''))return json({error:'نوع درخواست، اطلاعات پذیرش یا موعد معتبر نیست'},400);
  if(!validateOpsInput(item))return json({error:'عنوان، موضوع و شرح معتبر وارد کنید'},400);
  const candidate={...item,managerOnly:c?.id==='internal'||privateSubtypes.includes(b.subtype)||sensitive(b.title)};
  if(!canSeeOps(u,candidate)||sourceType==='incoming'&&!hasAccess(u,'calls'))return json({error:'اجازه ثبت در این بخش ندارید'},403);
  const assignee=String(b.assignee??u.email);if(!await validOpsAssignee(assignee,candidate))return json({error:'مسئول باید فعال باشد و دسترسی این پرونده را داشته باشد'},400);
  const id=crypto.randomUUID(),now=new Date().toISOString(),ticketFlag=f.isTicket&&direction!=='visit'&&channel!=='phone'?1:0;
  await db().batch([db().prepare('INSERT INTO ops_items (id,source_key,category,subtype,title,source_body,client_name,phone,email,reference,call_date,source_type,assignee,due,payment_state,manager_only,created_by,created_at,updated_at,direction,channel,visit_purpose,request_type,client_kind,organization,representative,intake_state,intake_notes,is_ticket,ticket_kind) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,'native:'+id,c!.id,b.subtype,b.title.trim(),item.sourceBody,String(b.clientName||'').slice(0,160),String(b.phone||'').slice(0,80),String(b.email||'').slice(0,200),String(b.reference||'').slice(0,160),String(b.callDate||'').slice(0,80),sourceType,assignee,b.due||'',c!.id==='billing'?'pending':'unknown',candidate.managerOnly?1:0,u.email,now,now,direction,channel,visitPurpose,f.requestType,f.clientKind,f.organization,f.representative,f.intakeState,f.intakeNotes,ticketFlag,f.ticketKind),await eventStmt(id,u.email,'ops-create','ثبت '+(direction==='visit'?'مراجعه حضوری':sourceType==='incoming'?'تماس':ticketFlag||channel!=='manual'?'تیکت پیام':'درخواست عملیاتی'))]);
  return json({ok:true,id});
 }
 const raw=await db().prepare('SELECT * FROM ops_items WHERE id=?').bind(String(b.id||'')).first<any>();
 if(!raw||!canSeeOps(u,raw))return json({error:'مورد پیدا نشد یا دسترسی ندارید'},404);
 if(b.action==='comment'){const body=String(b.body||'').trim();if(!body||body.length>12000)return json({error:'متن معتبر بنویسید'},400);await(await eventStmt(raw.id,u.email,'comment',body)).run();return json({ok:true})}
 if(b.action==='update'){
  if(!u.manager&&raw.assignee&&raw.assignee!==u.email)return json({error:'تغییر وضعیت فقط برای مسئول پیگیری یا مدیر مجاز است'},403);
  const f=intakeFields(b,raw);if(!validIntake(f)||!validDue(b.due??raw.due))return json({error:'اطلاعات پذیرش یا موعد معتبر نیست'},400);
  if(!opsStatuses[b.status]||!['normal','high','urgent'].includes(b.priority)||String(b.resolution||'').length>12000)return json({error:'وضعیت یا گزارش معتبر نیست'},400);
  if(b.status==='closed'&&!String(b.resolution||'').trim())return json({error:'برای بستن، نتیجه پیگیری را بنویسید'},400);
  if(!u.manager&&b.paymentState!==raw.payment_state&&(b.paymentState==='verified'||raw.payment_state==='verified'))return json({error:'تأیید بانکی فقط توسط مدیریت انجام می‌شود'},403);
  const paymentState=['unknown','pending','reported','verified'].includes(b.paymentState)?b.paymentState:raw.payment_state;
  const assignee=String(b.assignee??raw.assignee??u.email);
  if(!u.manager&&!assignee)return json({error:'برای ارجاع، مسئول فعال انتخاب کنید'},400);
  if(!await validOpsAssignee(assignee,raw))return json({error:'گیرنده باید فعال باشد و دسترسی این پرونده را داشته باشد'},400);
  const now=new Date().toISOString(),rev=Number(b.revision),due=b.due??raw.due,ticketFlag=f.isTicket&&raw.direction!=='visit'&&raw.channel!=='phone'&&raw.source_type!=='incoming'?1:0;
  const results=await db().batch([
   db().prepare('UPDATE ops_items SET status=?,priority=?,resolution=?,assignee=?,due=?,payment_state=?,request_type=?,client_kind=?,organization=?,representative=?,intake_state=?,intake_notes=?,is_ticket=?,ticket_kind=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(b.status,b.priority,String(b.resolution||''),assignee,due,paymentState,f.requestType,f.clientKind,f.organization,f.representative,f.intakeState,f.intakeNotes,ticketFlag,f.ticketKind,now,raw.id,rev),
   db().prepare('INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM ops_items WHERE id=? AND revision=? AND updated_at=?)').bind(crypto.randomUUID(),raw.id,u.email,'ops-update',JSON.stringify({from:raw.status,to:b.status,resolution:b.resolution,paymentState,fromAssignee:raw.assignee,toAssignee:assignee,fromDue:raw.due,toDue:due,intakeBefore:intakeFields({},raw),intakeAfter:f}),now,raw.id,rev+1,now)
  ]);
  if(!results[0].meta.changes)return json({error:'این مورد هم‌زمان تغییر کرده؛ دوباره بازش کنید'},409);
  return json({ok:true});
 }
 return json({error:'عملیات معتبر نیست'},400);
}
