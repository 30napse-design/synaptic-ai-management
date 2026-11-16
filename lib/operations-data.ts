import {redactRequest,mayReadRequestSource} from './dispatch-policy';
import {dispatchReady} from './dispatch-engine';
import {organizationReady} from './org-access';
import {channelSQL} from './communication-policy';
import {db} from './staff-server';
import {operationCategories,privateSubtypes,canSeeOps,operationsScope,canUseOpsCategory,requestedAccessScope} from './ops-policy';
import {opsRow} from './ops-server';
import {operationPayments} from './finance-data';
import {hasDataAccess} from './auth-policy';
import {intakeMembers} from './intake-server';
import {ticketSQL,isTicket} from './intake-policy';
export async function readOperationsData(u:any,p:URLSearchParams){
 const routingReady=await dispatchReady();const {sql:permitted,args:scopeArgs}=operationsScope(u,routingReady);
 const view=p.get('view')||'',contact=(p.get('contact')||'').trim().slice(0,200);
 let where=permitted;const args:any[]=[...scopeArgs];
 if(view==='history'&&contact){where+=' AND (lower(email)=? OR phone=?)';args.push(contact.toLowerCase(),contact)}else{where+=' AND direction=?';args.push(p.get('direction')||'inbound')}
 if(view==='tickets')where+=' AND '+ticketSQL;
 if(p.get('channel')){where+=' AND '+channelSQL+'=?';args.push(p.get('channel'))}
 for(const [key,column] of [['category','category'],['subtype','subtype'],['status','status'],['source','source_type'],['requestType','request_type'],['assignee','assignee'],['intakeState',"COALESCE(NULLIF(intake_state,''),'unreviewed')"]]){const value=p.get(key);if(value){where+=' AND '+column+'=?';args.push(value)}}
 const query=(p.get('q')||'').trim().slice(0,300);if(query){where+=" AND (title LIKE ? ESCAPE '\\' OR client_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR reference LIKE ? ESCAPE '\\' OR organization LIKE ? ESCAPE '\\' OR representative LIKE ? ESCAPE '\\' OR source_body LIKE ? ESCAPE '\\')";const escaped='%'+query.replace(/[\\%_]/g,'\\$&')+'%';args.push(...Array(8).fill(escaped))}
 const baseWhere=where,baseArgs=[...args];
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const followup=p.get('followup');if(followup==='today'){where+=" AND status!='closed' AND due=?";args.push(today)}else if(followup==='overdue'){where+=" AND status!='closed' AND due!='' AND due<?";args.push(today)}else if(followup==='unassigned'){where+=" AND status!='closed' AND trim(assignee)=''"}else if(followup==='unanswered'){where+=" AND status!='closed' AND trim(resolution)=''"}else if(followup==='calls_pending'){where+=" AND status!='closed' AND "+channelSQL+"='phone' AND trim(resolution)=''"}
 const offset=Math.max(0,Math.min(5000,Number(p.get('offset'))||0));
 const columns=(routingReady?'routing,request_state,':'')+(await organizationReady()?'access_scope,':'')+'request_type,client_kind,organization,representative,intake_state,intake_notes,is_ticket,ticket_kind,direction,channel,visit_purpose,id,source_key,category,subtype,title,substr(source_body,1,200) AS source_body,client_name,phone,email,reference,call_date,source_type,source_url,source_at,source_labels,attachments,assignee,due,status,priority,resolution,payment_state,manager_only,created_by,created_at,updated_at,revision';
 const statements=[db().prepare('SELECT '+columns+' FROM ops_items WHERE '+where+' ORDER BY COALESCE(NULLIF(source_at,\'\'),created_at) DESC LIMIT 50 OFFSET ?').bind(...args,offset),db().prepare('SELECT COUNT(*) AS total FROM ops_items WHERE '+where).bind(...args),db().prepare('SELECT category,COUNT(*) AS total FROM ops_items WHERE '+permitted+' GROUP BY category').bind(...scopeArgs),db().prepare("SELECT SUM(CASE WHEN status!='closed' AND due=? THEN 1 ELSE 0 END) AS today,SUM(CASE WHEN status!='closed' AND due!='' AND due<? THEN 1 ELSE 0 END) AS overdue,SUM(CASE WHEN status!='closed' AND trim(assignee)='' THEN 1 ELSE 0 END) AS unassigned,SUM(CASE WHEN status!='closed' AND trim(resolution)='' THEN 1 ELSE 0 END) AS unanswered,SUM(CASE WHEN status!='closed' AND "+channelSQL+"='phone' AND trim(resolution)='' THEN 1 ELSE 0 END) AS calls_pending FROM ops_items WHERE "+baseWhere).bind(today,today,...baseArgs),db().prepare('SELECT source,created,updated,finished_at FROM ops_sync_runs WHERE ?=1 ORDER BY finished_at DESC LIMIT 4').bind(u.manager?1:0)];
 const selected=p.get('id');if(selected)statements.push(db().prepare('SELECT * FROM ops_items WHERE id=? AND '+permitted).bind(selected,...scopeArgs));
 const rr=await db().batch(statements);const item=selected?(rr[5].results[0] as any):null;const allowedItem=item&&canSeeOps(u,item)?item:null;const events=allowedItem?(await db().prepare('SELECT * FROM staff_events WHERE record_id=? ORDER BY created_at ASC LIMIT 200').bind(selected).all()).results:[];
 const payments=await operationPayments([...new Set([...rr[0].results,...(allowedItem?[allowedItem]:[])].map((r:any)=>r.id))]);
 const map=(raw:any)=>{const r=redactRequest(u,raw),x=opsRow(r),financial=payments.get(r.id)||null;const paymentState=financial?.paid_rial>0?'verified':r.payment_state==='reported'?'reported':r.category==='billing'?'pending':'unknown';return {...x,payment_state:paymentState,paymentState,financial:u.manager||hasDataAccess(u,'billing_ops')?financial:null,isTicket:isTicket(x)}};
 const total=Number((rr[1].results[0] as any).total);const counts=Object.fromEntries(operationCategories.map(c=>[c.id,Number((rr[2].results.find((r:any)=>r.category===c.id) as any)?.total||0)]));
 const coverage=(await db().prepare("SELECT MAX(call_date) AS lastCallDate,MAX(source_at) AS lastSourceAt,COUNT(*) AS count FROM ops_items WHERE "+permitted+" AND source_type='incoming' AND source_key LIKE 'calls:incoming:%'").bind(...scopeArgs).first());
 return {coverage,user:u,items:rr[0].results.filter(r=>canSeeOps(u,r)).map(map),total,offset,nextOffset:offset+50<total?offset+50:null,counts,followups:rr[3].results[0],categories:operationCategories.map(c=>({...c,allowed:u.manager||c.items.some(subtype=>canUseOpsCategory(u,{category:c.id,subtype,access_scope:requestedAccessScope(u,{category:c.id,subtype},'')})),items:c.items.filter(subtype=>u.manager||canUseOpsCategory(u,{category:c.id,subtype,access_scope:requestedAccessScope(u,{category:c.id,subtype},'')}))})),selected:allowedItem?map(allowedItem):null,events:allowedItem&&!mayReadRequestSource(u,allowedItem)?events.map((e:any)=>({...e,body:'{}'})):events,members:await intakeMembers(),sync:u.manager?rr[4].results:[]};
}
