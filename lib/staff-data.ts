import {hasAccess,moduleKinds} from './auth-policy';
import {db,row} from './staff-server';
import {visible,OWNER} from './staff-policy';
export async function readStaffData(u:any){const scoped=Object.entries(moduleKinds).filter(([section])=>hasAccess(u,section)).map(([,kind])=>kind);const marks=scoped.map(()=>'?').join(',');
const clause='assignee=? OR reviewer=?'+(scoped.length?' OR kind IN ('+marks+')':'');const args=[u.email,u.email,...scoped];
const rr=await db().prepare(u.manager?'SELECT * FROM staff_records ORDER BY updated_at DESC LIMIT 1000':'SELECT * FROM staff_records WHERE '+clause+' ORDER BY updated_at DESC LIMIT 1000').bind(...(u.manager?[]:args)).all();
const mm=await db().prepare('SELECT email,name,role,active FROM staff_members ORDER BY name').all();
const eventClause='r.assignee=? OR r.reviewer=?'+(scoped.length?' OR r.kind IN ('+marks+')':'');
const ee=await db().prepare(u.manager?'SELECT * FROM staff_events ORDER BY created_at DESC LIMIT 2000':'SELECT e.* FROM staff_events e JOIN staff_records r ON r.id=e.record_id WHERE '+eventClause+' ORDER BY e.created_at DESC LIMIT 1000').bind(...(u.manager?[]:args)).all();
const authorized=rr.results.map(row).filter((r:any)=>visible(r,u));const ids=new Set(authorized.map((r:any)=>r.id));return {user:u,records:authorized,members:[{email:OWNER,name:'حمید اکرامی',role:'manager',active:1},...mm.results.filter((m:any)=>u.manager||m.active)],events:u.manager?ee.results:ee.results.filter((e:any)=>ids.has(e.record_id))}}
