import {requestOrigin} from '../../../../lib/request-origin';
import {identity,json,mutationAllowed} from '../../../../lib/staff-server';
import {readStandaloneSampleIntake,writeStandaloneSampleIntake} from '../../../../lib/standalone-sample-intake';
export async function GET(req:Request){try{return json(await readStandaloneSampleIntake(await identity(),new URL(req.url).searchParams))}catch(e:any){return json({error:e.status?e.message:'فهرست برگه‌های نمونه قابل خواندن نیست.'},e.status||500)}}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر است.'},403);try{return json(await writeStandaloneSampleIntake(await identity(),await req.json()))}catch(e:any){return json({error:e.status?e.message:'ثبت برگه نمونه انجام نشد.'},e.status||500)}}
