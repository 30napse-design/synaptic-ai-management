import {canReadOperationWork} from './operation-work-link';
import {db,row} from './staff-server';
import {visible} from './staff-policy';
import {participant} from './work-policy';
export class WorkError extends Error{constructor(message:string,public status=400){super(message)}}
export async function workRecord(id:string,u:any){const r=await db().prepare('SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id WHERE r.id=?').bind(id).first<any>();if(!r)throw new WorkError('کار پیدا نشد.',404);const data={...row(r),...JSON.parse(r.details||'{}')};if(data.manualOperationId&&!canReadOperationWork(u,data,await db().prepare('SELECT * FROM ops_items WHERE id=?').bind(data.manualOperationId).first()))throw new WorkError('درخواست اصلی مجاز نیست.',403);if(!visible(data,u))throw new WorkError('دسترسی ندارید.',403);return data}
export const canExecute=(r:any,u:any)=>u.manager||participant(r,u);
export async function notification(id:string,recordId:string,recipient:string,body:string,eventId:string,ts:string){return db().prepare('INSERT OR IGNORE INTO staff_work_notifications(id,recipient,record_id,body,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM staff_events WHERE id=?)').bind(id,recipient,recordId,body,ts,eventId)}
