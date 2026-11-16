import {limitedText} from '../../../../../lib/integration-store';
import {json} from '../../../../../lib/staff-server';
import {signedSource,ingest,healthError} from '../../../../../lib/input-sources';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;try{const raw=await limitedText(req,200000);if(raw.length>200000)return json({error:'بدنه بیش از حد بزرگ است.'},413);const s=await signedSource(req,id,raw);try{return json(await ingest(s,JSON.parse(raw).events))}catch(e){await healthError(id,'event-validation-or-routing-error');throw e}}catch(e:any){return json({error:e.status?e.message:'دریافت انجام نشد؛ رویداد را در منبع حفظ کنید.'},e.status||400)}}
