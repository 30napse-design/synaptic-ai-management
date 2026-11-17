import {IntegrationError} from '../../../lib/integration-store';
import {recordPaymentNotice} from '../../../lib/payment-notice';
import {canCoordinate} from '../../../lib/lab-execution-policy';
import {WorkflowError} from '../../../lib/workflow-policy';
import {LabError} from '../../../lib/lab-execution-write';
import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canQuote} from '../../../lib/finance-policy';
import {readFinanceData,readExecutionHandoffs} from '../../../lib/finance-data';
import {writeFinance,FinanceError} from '../../../lib/finance-write';
export const dynamic='force-dynamic';
export async function GET(req:Request){const u=await identity();if(new URL(req.url).searchParams.get('view')==='execution'){if(!canCoordinate(u))return json({error:'مجوز هماهنگی اجرا لازم است.'},403);return json(await readExecutionHandoffs())}if(!canQuote(u))return json({error:'دسترسی مالی ندارید.'},403);return json(await readFinanceData(u))}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر.'},403);const u=await identity();if(!u)return json({error:'ابتدا وارد شوید.'},401);try{const raw=await req.text();if(raw.length>1000000)return json({error:'حجم درخواست زیاد است.'},413);const b=JSON.parse(raw);if(b.action==='payment_notice')return json(await recordPaymentNotice(u,b,new URL(req.url).origin));if(!canQuote(u))return json({error:'دسترسی مالی ندارید.'},403);return json(await writeFinance(u,b,new URL(req.url).origin))}catch(e:any){if(e instanceof IntegrationError||e instanceof FinanceError||e instanceof LabError||e instanceof WorkflowError)return json({error:e.message},e.status);console.error('finance mutation failed',e);return json({error:'ثبت انجام نشد؛ اطلاعات و نسخه جاری را بررسی کنید.'},400)}}
