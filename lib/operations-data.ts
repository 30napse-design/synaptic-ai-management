import {db} from './staff-server';
import {operationCategories,privateSubtypes,canSeeOps} from './ops-policy';
import {opsRow} from './ops-server';
import {hasAccess} from './auth-policy';
export async function readOperationsData(u:any,p:URLSearchParams){
 const visibleCategories=operationCategories.filter(c=>u.manager||c.id!=='internal'&&hasAccess(u,c.scope)).map(c=>c.id);
 const marks=visibleCategories.map(()=>'?').join(',');
 const permitted=u.manager?'1=1':`manager_only=0 AND category IN (${marks||"''"}) AND subtype NOT IN (${privateSubtypes.map(()=>'?').join(',')})`;
 const scopeArgs=u.manager?[]:[...visibleCategories,...privateSubtypes];
 let where=permitted;const args:any[]=[...scopeArgs];for(const [key,column] of [['category','category'],['subtype','subtype'],['status','status'],['source','source_type']]){const value=p.get(key);if(value){where+=' AND '+column+'=?';args.push(value)}}
 const query=(p.get('q')||'').trim().slice(0,300);if(query){where+=" AND (title LIKE ? ESCAPE '\\' OR client_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR reference LIKE ? ESCAPE '\\' OR source_body LIKE ? ESCAPE '\\')";const escaped='%'+query.replace(/[\\%_]/g,'\\$&')+'%';args.push(...Array(6).fill(escaped))}
 const offset=Math.max(0,Math.min(5000,Number(p.get('offset'))||0));
 const columns='id,source_key,category,subtype,title,substr(source_body,1,200) AS source_body,client_name,phone,email,reference,call_date,source_type,source_url,source_at,source_labels,attachments,assignee,due,status,priority,resolution,payment_state,manager_only,created_by,created_at,updated_at,revision';
 const statements=[db().prepare('SELECT '+columns+' FROM ops_items WHERE '+where+' ORDER BY COALESCE(NULLIF(source_at,\'\'),created_at) DESC LIMIT 50 OFFSET ?').bind(...args,offset),db().prepare('SELECT COUNT(*) AS total FROM ops_items WHERE '+where).bind(...args),db().prepare('SELECT category,COUNT(*) AS total FROM ops_items WHERE '+permitted+' GROUP BY category').bind(...scopeArgs),db().prepare('SELECT email,name FROM staff_members WHERE active=1 ORDER BY name'),db().prepare('SELECT source,created,updated,finished_at FROM ops_sync_runs ORDER BY finished_at DESC LIMIT 4')];
 const selected=p.get('id');if(selected)statements.push(db().prepare('SELECT * FROM ops_items WHERE id=? AND '+permitted).bind(selected,...scopeArgs));
 const rr=await db().batch(statements);const item=selected?(rr[5].results[0] as any):null;const allowedItem=item&&canSeeOps(u,item)?item:null;const events=allowedItem?(await db().prepare('SELECT * FROM staff_events WHERE record_id=? ORDER BY created_at ASC LIMIT 200').bind(selected).all()).results:[];
 const total=Number((rr[1].results[0] as any).total);const counts=Object.fromEntries(operationCategories.map(c=>[c.id,Number((rr[2].results.find((r:any)=>r.category===c.id) as any)?.total||0)]));
 return {user:u,items:rr[0].results.filter(r=>canSeeOps(u,r)).map(opsRow),total,offset,nextOffset:offset+50<total?offset+50:null,counts,categories:operationCategories.map(c=>({...c,allowed:u.manager||hasAccess(u,c.scope),items:c.items.filter(s=>u.manager||!privateSubtypes.includes(s))})),selected:allowedItem?opsRow(allowedItem):null,events,members:[{email:'ekramiihamid@gmail.com',name:'مدیریت'},...rr[3].results],sync:rr[4].results};
}
