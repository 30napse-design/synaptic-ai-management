import {hasAccess} from './auth-policy.ts';
import {visible} from './staff-policy.ts';
import {workSummary} from './work-policy.ts';

// Home is a compact projection of the central work records, never a second task store.
export function homeDashboard(records:any[],user:any,today:string,now=new Date()){
  const summary=workSummary(records,user,today);
  const rank:Record<string,number>={urgent:0,high:1,normal:2};
  const current=summary.today.filter(r=>r.status!=='done'&&r.status!=='review'&&r.kind!=='plan');
  const priorities=[...current].sort((a,b)=>(rank[a.priority]??2)-(rank[b.priority]??2)||(a.startTime||'99:99').localeCompare(b.startTime||'99:99')||(a.due||'9999').localeCompare(b.due||'9999')||a.id.localeCompare(b.id)).slice(0,3);
  const ids=new Set(priorities.map(r=>r.id));
  const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
  const nextPlan=[...summary.mine].filter(r=>r.status!=='done'&&!ids.has(r.id)&&(r.kind==='plan'||r.scheduledDate)&&((r.scheduledDate||r.due)>today||(r.scheduledDate||r.due)===today&&(!r.endTime||r.endTime>=clock))).sort((a,b)=>(a.scheduledDate||a.due).localeCompare(b.scheduledDate||b.due)||(a.startTime||'00:00').localeCompare(b.startTime||'00:00')||a.id.localeCompare(b.id))[0]||null;
  return {priorities,nextPlan,counts:{today:current.length,decisions:summary.review.length,overdue:summary.overdue.length}};
}

export function personalCorrespondence(records:any[],user:any){
  if(!hasAccess(user,'mail'))return [];
  return records.filter(r=>r.kind==='correspondence'&&visible(r,user)&&(r.assignee===user.email||r.reviewer===user.email||r.createdBy===user.email||(r.collaborators||[]).includes(user.email))).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0,8);
}
