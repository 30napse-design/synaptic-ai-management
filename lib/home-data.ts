import {readStaffData} from './staff-data';
import {db} from './staff-server';
import {personalWork,dateKey} from './home-policy';
import {homeDashboard} from './home-dashboard';

export async function readHomeData(user:any){
  const now=new Date(),today=dateKey(now),staff=await readStaffData(user);
  const ids=new Set(staff.records.map((r:any)=>r.id));
  // SQL scopes the recipient; the record allowlist applies current module permissions too.
  const unread=await db().prepare("SELECT id,record_id,body,created_at FROM staff_work_notifications WHERE recipient=? AND read_at='' ORDER BY created_at DESC,id DESC").bind(user.email).all();
  const importantNotification=unread.results.find((n:any)=>ids.has(n.record_id))||null;
  return {...personalWork(staff.records,user,today),dashboard:homeDashboard(staff.records,user,today,now),importantNotification,today};
}
