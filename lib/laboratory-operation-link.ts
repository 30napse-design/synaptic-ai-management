import {db} from './staff-server';
import {check,stamp} from './integration-store';
import {canSeeOps,canUseOpsCategory} from './ops-policy';
import {mayReadRequestSource,requestRouting} from './dispatch-policy';
import {canMother,motherProject} from './laboratory-mother';
const invoiceKey=(s:any)=>String(s||'').trim().replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c>='۰'?1776:1632))).toUpperCase();
export async function laboratoryOperation(u:any,id:string){
 check(canMother(u),'اتصال پذیرش فقط برای مسئول مجاز پرونده است.',403);
 const op=await db().prepare('SELECT * FROM ops_items WHERE id=?').bind(id).first<any>();
 check(op&&canSeeOps(u,op)&&canUseOpsCategory(u,op)&&mayReadRequestSource(u,op),'درخواست مجاز پذیرش پیدا نشد.',403);
 return op;
}
export async function laboratoryOperationContext(u:any,id:string){
 const op=await laboratoryOperation(u,id),linked=requestRouting(op)?.laboratoryProjectId||'';
 if(linked)await motherProject(u,linked);
 return {id:op.id,revision:op.revision,title:op.title,client_name:op.client_name,phone:op.phone,email:op.email,reference:op.reference,linked_project_id:linked};
}
// Explicit, audited identity matching. Never creates a customer/order or alters human status.
export async function linkLaboratoryOperation(u:any,b:any){
 const op=await laboratoryOperation(u,String(b.operation_id||'')),r=await motherProject(u,String(b.id||'')),current=requestRouting(op)?.laboratoryProjectId;
 if(current){check(current===r.id,'درخواست به پرونده دیگری متصل است؛ ارتباط قبلی محفوظ است.',409);return {ok:true,id:r.id,replayed:true};}
 check(b.identity_confirmed===true&&typeof b.identity_reason==='string'&&b.identity_reason.trim().length>=10&&b.identity_reason.length<=2000,'تطبیق هویت و فاکتور با توضیح مستند لازم است.');
 check(invoiceKey(b.confirm_invoice)===invoiceKey(r.details.mother.invoice_number),'شماره فاکتور تأییدشده با پرونده مقصد یکسان نیست.',409);
 check(Number(b.operation_revision)===op.revision,'درخواست پذیرش تغییر کرده است؛ بازخوانی کنید.',409);
 const at=stamp(),event='laboratory-operation:'+op.id,body=JSON.stringify({operation_id:op.id,project_id:r.id,invoice_number:r.details.mother.invoice_number,reason:b.identity_reason.trim()});
 const out=await db().batch([
 db().prepare("UPDATE ops_items SET routing=json_set(COALESCE(NULLIF(routing,''),'{}'),'$.laboratoryProjectId',?),revision=revision+1,updated_at=? WHERE id=? AND revision=? AND COALESCE(json_extract(routing,'$.laboratoryProjectId'),'')='' ").bind(r.id,at,op.id,op.revision),
 db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,NULL,'','','','' WHERE changes()!=1").bind(event+':operation-assert'),
 db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) VALUES(?,?,?,'laboratory-project-linked',?,?)").bind(event,op.id,u.email,body,at),
 db().prepare("UPDATE staff_work_details SET details=json_set(details,'$.mother.operation_ids',json(?)) WHERE record_id=? AND EXISTS(SELECT 1 FROM staff_events WHERE id=?) AND EXISTS(SELECT 1 FROM staff_records WHERE id=? AND revision=?)").bind(JSON.stringify([...new Set([...(r.details.mother.operation_ids||[]),op.id])]),r.id,event,r.id,r.revision),
 db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,NULL,'','','','' WHERE changes()!=1").bind(event+':assert'),
 db().prepare('UPDATE staff_records SET revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(at,r.id,r.revision),
 db().prepare("INSERT INTO staff_events(id,record_id,actor,action,body,created_at) SELECT ?,?,?,'laboratory-operation-linked',?,? WHERE changes()=1").bind(event+':mother',r.id,u.email,body,at)
 ]);
 check(out[0].meta.changes,'ارتباط هم‌زمان تغییر کرد؛ بازخوانی کنید.',409);
 return {ok:true,id:r.id};
}
