import {db,row} from './staff-server';
import {visible} from './staff-policy';
import {hasDataAccess} from './auth-policy';
import {check} from './integration-store';
import type {KnowledgeChunk} from './assistant-policy';
function permitted(r:any,u:any){return visible(r,u)&&(r.kind!=='invoice'||u.manager||hasDataAccess(u,'billing_ops')||hasDataAccess(u,'finance_ops'))}
export async function assistantWorkOptions(u:any){if(u.laboratory)return [];const rows=(await db().prepare("SELECT r.* FROM staff_records r WHERE r.assignee=?1 OR r.reviewer=?1 ORDER BY r.updated_at DESC LIMIT 50").bind(u.email).all()).results as any[];return rows.map(row).filter(r=>permitted(r,u)).slice(0,20).map(r=>({id:r.id,title:r.title}))}
export async function assistantWorkContext(id:any,u:any,mode:any,externalAllowed:boolean):Promise<KnowledgeChunk[]>{if(!id)return [];check(typeof id==='string'&&id.length<=160,'وظیفه معتبر انتخاب شود.');const r=await db().prepare('SELECT * FROM staff_records WHERE id=?').bind(id).first<any>();check(r&&permitted(row(r),u),'وظیفه پیدا نشد یا دسترسی ندارید.',403);return [{id:'work:'+r.id+':'+r.revision,document:'authorized-work-context',version:String(r.revision),category:mode,scope:'people',title:r.title,text:('عنوان: '+r.title+'\nشرح: '+r.body+'\nوضعیت: '+r.status+'\nموعد: '+r.due+'\nنتیجه ثبت‌شده: '+r.result).slice(0,4000),href:'/staff?view=all',approved:true,externalAllowed}]}
