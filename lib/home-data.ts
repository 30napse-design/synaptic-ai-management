import {canUseOps,operationsScope} from './ops-policy';
import {dispatchSchemaReady} from './dispatch-schema';
import {readStaffData} from './staff-data';
import {db} from './staff-server';
import {personalWork,dateKey} from './home-policy';
import {homeDashboard} from './home-dashboard';

async function operationalOverview(user:any){
 if(!canUseOps(user))return null;
 const scoped=operationsScope(user,await dispatchSchemaReady());
 const sql="SELECT COUNT(*) AS all_count, SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) AS new_count, SUM(CASE WHEN status='doing' THEN 1 ELSE 0 END) AS doing_count, SUM(CASE WHEN status IN ('waiting','review') THEN 1 ELSE 0 END) AS waiting_count, SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) AS closed_count, SUM(CASE WHEN status!='closed' AND trim(COALESCE(assignee,''))='' THEN 1 ELSE 0 END) AS unassigned_count, SUM(CASE WHEN source_type='gmail' THEN 1 ELSE 0 END) AS gmail_count, SUM(CASE WHEN source_type='incoming' THEN 1 ELSE 0 END) AS incoming_count FROM ops_items WHERE "+scoped.sql;
 const row=await db().prepare(sql).bind(...scoped.args).first<any>();
 return {all:Number(row?.all_count||0),new:Number(row?.new_count||0),doing:Number(row?.doing_count||0),waiting:Number(row?.waiting_count||0),closed:Number(row?.closed_count||0),unassigned:Number(row?.unassigned_count||0),gmail:Number(row?.gmail_count||0),incoming:Number(row?.incoming_count||0)};
}

export async function readHomeData(user:any){
  const now=new Date(),today=dateKey(now),staff=await readStaffData(user);
  const ids=new Set(staff.records.map((r:any)=>r.id));
  // SQL scopes the recipient; the record allowlist applies current module permissions too.
  const unread=await db().prepare("SELECT id,record_id,body,created_at FROM staff_work_notifications WHERE recipient=? AND read_at='' ORDER BY created_at DESC,id DESC").bind(user.email).all();
  const importantNotification=unread.results.find((n:any)=>ids.has(n.record_id))||null;
  return {...personalWork(staff.records,user,today),dashboard:homeDashboard(staff.records,user,today,now),operationsOverview:await operationalOverview(user),importantNotification,todayKey:today};
}
