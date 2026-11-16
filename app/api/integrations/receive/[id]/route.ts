import {acquireIntegrationLease} from '../../../../../lib/integration-lease';
import {limitedText} from '../../../../../lib/integration-store';
import {json} from '../../../../../lib/staff-server';
import {signedSource,ingest,healthError} from '../../../../../lib/input-sources';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;try{const raw=await limitedText(req,200000);if(raw.length>200000)return json({error:'بدنه بیش از حد بزرگ است.'},413);const s=await signedSource(req,id,raw);const lease=await acquireIntegrationLease('source:'+id);if(!lease)return json({error:'Source is processing; retry the same event IDs.'},409);try{return json(await ingest(s,JSON.parse(raw).events,lease))}catch(e){await healthError(id,'event-validation-or-routing-error');throw e}finally{await lease.release()}}catch(e:any){return json({error:e.status?e.message:'دریافت انجام نشد؛ رویداد را در منبع حفظ کنید.'},e.status||400)}}
