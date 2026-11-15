import {db,row} from './staff-server';
import {visible} from './staff-policy';
import {canSeeOps,operationsScope} from './ops-policy';
import {canFinance} from './finance-policy';
export async function globalSearch(user:any,query:string){
 const q=query.trim().slice(0,160);if(q.length<2)return [];
 const like='%'+q.replace(/[\\%_]/g,'\\$&')+'%';const hits:any[]=[];
 // Candidates are bounded on the server; every result is checked by the owning module policy.
 if(!user.laboratory){const rs=await db().prepare("SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id WHERE (r.id LIKE ? ESCAPE '\\' OR r.title LIKE ? ESCAPE '\\' OR r.body LIKE ? ESCAPE '\\' OR r.ref LIKE ? ESCAPE '\\' OR json_extract(w.details,'$.project') LIKE ? ESCAPE '\\') AND (?=1 OR r.assignee=? OR r.reviewer=? OR EXISTS(SELECT 1 FROM json_each(w.details,'$.collaborators') j WHERE j.value=?)) ORDER BY r.updated_at DESC LIMIT 100").bind(...Array(5).fill(like),user.manager?1:0,user.email,user.email,user.email).all();
 for(const raw of rs.results as any[]){const x={...row(raw),...JSON.parse(raw.details||'{}')};if(visible(x,user))hits.push({id:'work:'+x.id,title:x.title,href:(x.kind==='correspondence'?'/work/mail':'/staff')+'?id='+encodeURIComponent(x.id),kind:x.kind==='project'?'پروژه':x.kind==='order'?'سفارش':'کارتابل'});}}
 const scope=operationsScope(user);
 const ops=await db().prepare("SELECT * FROM ops_items WHERE "+scope.sql+" AND (title LIKE ? ESCAPE '\\' OR client_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR reference LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\' OR organization LIKE ? ESCAPE '\\') ORDER BY updated_at DESC LIMIT 100").bind(...scope.args,...Array(7).fill(like)).all();
 for(const x of ops.results as any[])if(canSeeOps(user,x))hits.push({id:'ops:'+x.id,title:[x.client_name,x.title,x.reference].filter(Boolean).join(' · '),href:'/operations?id='+encodeURIComponent(x.id),kind:'مشتری / پرونده'});
 if(canFinance(user)){const docs=await db().prepare("SELECT id,number,kind,payload FROM finance_documents WHERE number LIKE ? ESCAPE '\\' OR json_extract(payload,'$.client') LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\' ORDER BY updated_at DESC LIMIT 12").bind(like,like,like).all();for(const x of docs.results as any[])hits.push({id:'finance:'+x.id,title:x.number+' · '+(JSON.parse(x.payload).client||''),kind:'سند مالی',href:'/finance-print/'+encodeURIComponent(x.id)});}
 return hits.slice(0,24);
}
