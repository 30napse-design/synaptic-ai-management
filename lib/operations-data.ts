import {canManualAssignOperations} from './operations-manual-assignment';
import {ticketNoteVisible,redactRequest,mayReadRequestSource} from './dispatch-policy';
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
import {siteTicketCategories,getTicketCategories} from './ticket-support-taxonomy';
export async function readOperationsData(u:any,p:URLSearchParams){
 const routingReady=await dispatchReady();const {sql:permitted,args:scopeArgs}=operationsScope(u,routingReady);
 const view=p.get('view')||'',contact=(p.get('contact')||'').trim().slice(0,200);
 let where=permitted;const args:any[]=[...scopeArgs];
 if(view==='history'&&contact){where+=' AND (lower(email)=? OR phone=?)';args.push(contact.toLowerCase(),contact)}else{where+=' AND direction=?';args.push(p.get('direction')||'inbound')}
 if(view==='tickets'){
  where+=' AND '+ticketSQL;
  const source=(p.get('ticketSource')||'').trim().slice(0,20);
  const ticketCategory=(p.get('ticketCategory')||'').trim().slice(0,80);
  const ticketTopic=(p.get('ticketTopic')||'').trim().slice(0,160);
  if(source){where+=" AND json_extract(source_labels,'$.ticket_source')=?";args.push(source)}
  if(ticketCategory){
   const cat=(source==='direct'?getTicketCategories('direct'):siteTicketCategories).find(c=>c.id===ticketCategory);
   const legacyGroups:Record<string,string>={orders:'customers',invoices:'billing',payments:'billing',results:'results',projects:'projects',internal:'internal',system:'system'};
   if(!cat){where+=' AND 1=0'}
   else if(source){where+=" AND json_extract(source_labels,'$.ticket_category')=?";args.push(ticketCategory)}
   else{
    where+=" AND (json_extract(source_labels,'$.ticket_category')=?"+(legacyGroups[ticketCategory]?" OR (COALESCE(json_extract(source_labels,'$.ticket_v'),0)=0 AND category=?)":"")+")";
    args.push(ticketCategory);if(legacyGroups[ticketCategory])args.push(legacyGroups[ticketCategory]);
   }
  }
  if(ticketTopic){
   const cat=(source==='direct'?getTicketCategories('direct'):siteTicketCategories).find(c=>c.id===ticketCategory);
   if(!cat||!cat.topics.includes(ticketTopic)){where+=' AND 1=0'}
   else{
    // Never guess a precise topic for a legacy message: only exact historic subtype matches.
    where+=" AND (json_extract(source_labels,'$.ticket_topic')=?"+(!source?" OR (COALESCE(json_extract(source_labels,'$.ticket_v'),0)=0 AND subtype=?)":"")+")";
    args.push(ticketTopic);if(!source)args.push(ticketTopic);
   }
  }
}
 if(p.get('channel')){where+=' AND '+channelSQL+'=?';args.push(p.get('channel'))}
 for(const [key,column] of [['category','category'],['subtype','subtype'],['status','status'],['source','source_type'],['requestType','request_type'],['assignee','assignee'],['intakeState',"COALESCE(NULLIF(intake_state,''),'unreviewed')"]]){const value=p.get(key);if(value&&!(view==='tickets'&&key==='status')){where+=' AND '+column+'=?';args.push(value)}}
 const query=(p.get('q')||'').trim().slice(0,300);if(query){where+=" AND (title LIKE ? ESCAPE '\\' OR client_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR reference LIKE ? ESCAPE '\\' OR organization LIKE ? ESCAPE '\\' OR representative LIKE ? ESCAPE '\\' OR source_body LIKE ? ESCAPE '\\')";const escaped='%'+query.replace(/[\\%_]/g,'\\$&')+'%';args.push(...Array(8).fill(escaped))}
 const ticketBaseWhere=where,ticketBaseArgs=[...args];
 if(view==='tickets'&&p.get('status')){where+=' AND status=?';args.push(p.get('status'))}
 const baseWhere=where,baseArgs=[...args];
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const followup=p.get('followup');if(followup==='today'){where+=" AND status!='closed' AND due=?";args.push(today)}else if(followup==='overdue'){where+=" AND status!='closed' AND due!='' AND due<?";args.push(today)}else if(followup==='unassigned'){where+=" AND status!='closed' AND (trim(assignee)='' OR json_extract(routing,'$.acceptanceNeedsAssignment')=1)"}else if(followup==='unanswered'){where+=" AND status!='closed' AND trim(resolution)=''"}else if(followup==='calls_pending'){where+=" AND status!='closed' AND "+channelSQL+"='phone' AND trim(resolution)=''"}
 const offset=Math.max(0,Math.min(5000,Number(p.get('offset'))||0));
 const initialPageSize=view==='tickets'?100:50;
 const columns=(routingReady?'routing,request_state,':'')+(await organizationReady()?'access_scope,':'')+'request_type,client_kind,organization,representative,intake_state,intake_notes,is_ticket,ticket_kind,direction,channel,visit_purpose,id,source_key,category,subtype,title,substr(source_body,1,200) AS source_body,client_name,phone,email,reference,call_date,source_type,source_url,source_at,source_labels,attachments,assignee,due,status,priority,resolution,payment_state,manager_only,created_by,created_at,updated_at,revision';
 const statements=[db().prepare('SELECT '+columns+' FROM ops_items WHERE '+where+' ORDER BY COALESCE(NULLIF(source_at,\'\'),created_at) DESC LIMIT '+initialPageSize+' OFFSET ?').bind(...args,offset),db().prepare('SELECT COUNT(*) AS total FROM ops_items WHERE '+where).bind(...args),db().prepare('SELECT category,COUNT(*) AS total FROM ops_items WHERE '+permitted+' GROUP BY category').bind(...scopeArgs),db().prepare("SELECT SUM(CASE WHEN status!='closed' AND due=? THEN 1 ELSE 0 END) AS today,SUM(CASE WHEN status!='closed' AND due!='' AND due<? THEN 1 ELSE 0 END) AS overdue,SUM(CASE WHEN status!='closed' AND (trim(assignee)='' OR json_extract(routing,'$.acceptanceNeedsAssignment')=1) THEN 1 ELSE 0 END) AS unassigned,SUM(CASE WHEN status!='closed' AND trim(resolution)='' THEN 1 ELSE 0 END) AS unanswered,SUM(CASE WHEN status!='closed' AND "+channelSQL+"='phone' AND trim(resolution)='' THEN 1 ELSE 0 END) AS calls_pending FROM ops_items WHERE "+baseWhere).bind(today,today,...baseArgs),db().prepare('SELECT source,created,updated,finished_at FROM ops_sync_runs WHERE ?=1 ORDER BY finished_at DESC LIMIT 4').bind(u.manager?1:0)];
 if(view==='tickets')statements.push(db().prepare("SELECT COUNT(*) AS all_count,SUM(CASE WHEN status!='closed' AND due=? THEN 1 ELSE 0 END) AS today_count,SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS new_count,SUM(CASE WHEN status='waiting' THEN 1 ELSE 0 END) AS waiting_count FROM ops_items WHERE "+ticketBaseWhere).bind(today,...ticketBaseArgs));
 const selected=p.get('id');if(selected)statements.push(db().prepare('SELECT * FROM ops_items WHERE id=? AND '+permitted).bind(selected,...scopeArgs));
 const rr=await db().batch(statements);const item=selected?(rr[view==='tickets'?6:5].results[0] as any):null;const allowedItem=item&&canSeeOps(u,item)?item:null;const events=allowedItem?(await db().prepare('SELECT * FROM staff_events WHERE record_id=? ORDER BY created_at ASC LIMIT 200').bind(selected).all()).results.filter((e:any)=>ticketNoteVisible(u,e)):[];
 const payments=await operationPayments([...new Set([...rr[0].results,...(allowedItem?[allowedItem]:[])].map((r:any)=>r.id))]);
 const map=(raw:any)=>{const r=redactRequest(u,raw),x=opsRow(r),financial=payments.get(r.id)||null;const paymentState=financial?.paid_rial>0?'verified':r.payment_state==='reported'?'reported':r.category==='billing'?'pending':'unknown';return {...x,payment_state:paymentState,paymentState,financial:u.manager||hasDataAccess(u,'billing_ops')?financial:null,isTicket:isTicket(x)}};
 const total=Number((rr[1].results[0] as any).total);const counts=Object.fromEntries(operationCategories.map(c=>[c.id,Number((rr[2].results.find((r:any)=>r.category===c.id) as any)?.total||0)]));
 const coverage=(await db().prepare("SELECT MAX(call_date) AS lastCallDate,MAX(source_at) AS lastSourceAt,COUNT(*) AS count FROM ops_items WHERE "+permitted+" AND source_type='incoming' AND source_key LIKE 'calls:incoming:%'").bind(...scopeArgs).first());
 return {coverage,manualAssignment:canManualAssignOperations(u),user:u,items:rr[0].results.filter(r=>canSeeOps(u,r)).map(map),total,offset,nextOffset:offset+initialPageSize<total?offset+initialPageSize:null,counts,followups:rr[3].results[0],ticketSummary:view==='tickets'?{all:Number((rr[5].results[0] as any)?.all_count||0),today:Number((rr[5].results[0] as any)?.today_count||0),new:Number((rr[5].results[0] as any)?.new_count||0),waiting:Number((rr[5].results[0] as any)?.waiting_count||0)}:null,categories:operationCategories.map(c=>({...c,allowed:u.manager||c.items.some(subtype=>canUseOpsCategory(u,{category:c.id,subtype,access_scope:requestedAccessScope(u,{category:c.id,subtype},'')})),items:c.items.filter(subtype=>u.manager||canUseOpsCategory(u,{category:c.id,subtype,access_scope:requestedAccessScope(u,{category:c.id,subtype},'')}))})),selected:allowedItem?map(allowedItem):null,events:allowedItem&&!mayReadRequestSource(u,allowedItem)?events.map((e:any)=>({...e,body:'{}'})):events,members:await intakeMembers(),sync:u.manager?rr[4].results:[]};
}
