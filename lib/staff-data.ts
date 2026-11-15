import {myOrganizationalResponsibilities} from './organizational-data';
import {db,row} from './staff-server';
import {visible,OWNER} from './staff-policy';
export async function readStaffData(u:any){
const collaborator="EXISTS(SELECT 1 FROM staff_work_details w,json_each(w.details,'$.collaborators') j WHERE w.record_id=r.id AND j.value=?)";
const clause='r.assignee=? OR r.reviewer=? OR '+collaborator;const args=[u.email,u.email,u.email];
const records:any[]=[];let offset=0;for(;;){const page=await db().prepare('SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id'+(u.manager?'':' WHERE '+clause)+' ORDER BY r.updated_at DESC,r.id LIMIT 500 OFFSET ?').bind(...(u.manager?[]:args),offset).all();records.push(...page.results.map((r:any)=>({...row(r),...JSON.parse(r.details||'{}')})));if(page.results.length<500)break;offset+=500}
const mm=await db().prepare('SELECT email,name,role,active FROM staff_members ORDER BY name').all();
const ee=await db().prepare('SELECT e.* FROM staff_events e JOIN staff_records r ON r.id=e.record_id'+(u.manager?'':' WHERE '+clause)+' ORDER BY e.created_at DESC,e.id').bind(...(u.manager?[]:args)).all();
const authorized=records.filter((r:any)=>visible(r,u));const ids=new Set(authorized.map((r:any)=>r.id));const files=await db().prepare('SELECT id,record_id,file_name,size,created_by,created_at FROM staff_work_files').all();
return {organization:await myOrganizationalResponsibilities(u),user:u,records:authorized,members:[{email:OWNER,name:'حمید اکرامی',role:'manager',active:1},...mm.results.filter((m:any)=>u.manager||m.active)],events:ee.results.filter((e:any)=>ids.has(e.record_id)),files:files.results.filter((f:any)=>ids.has(f.record_id))}}
