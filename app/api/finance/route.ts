import {LabError} from '../../../lib/lab-execution-write';
import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canFinance} from '../../../lib/finance-policy';
import {readFinanceData} from '../../../lib/finance-data';
import {writeFinance,FinanceError} from '../../../lib/finance-write';
export const dynamic='force-dynamic';
export async function GET(){const u=await identity();if(!canFinance(u))return json({error:'دسترسی مالی ندارید.'},403);return json(await readFinanceData(u))}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر.'},403);const u=await identity();if(!canFinance(u))return json({error:'دسترسی مالی ندارید.'},403);try{const raw=await req.text();if(raw.length>1000000)return json({error:'حجم درخواست زیاد است.'},413);return json(await writeFinance(u,JSON.parse(raw),new URL(req.url).origin))}catch(e:any){if(e instanceof FinanceError||e instanceof LabError)return json({error:e.message},e.status);console.error('finance mutation failed',e);return json({error:'ثبت انجام نشد؛ اطلاعات و نسخه جاری را بررسی کنید.'},400)}}
