import {db} from './staff-server';
import {jobMetadata} from './laboratory-center-policy';
import {check} from './integration-store';
export async function laboratoryWriteGuard(j:any,entity?:{kind:string,id:string}){const id=jobMetadata(j).mother_project;if(!id)return;const row=await db().prepare('SELECT details FROM staff_work_details WHERE record_id=?').bind(id).first<any>();if(!row)return;const m=JSON.parse(row.details).mother;check(!m?.archived&&!m?.archived_entities?.some((e:any)=>e.kind==='job'&&e.id===j.id||!!entity&&e.kind===entity.kind&&e.id===entity.id),'پرونده یا سفارش بایگانی شده است؛ ابتدا بازیابی مستند لازم است.',409);}
