import {SampleCustodyError} from '../../../lib/sample-custody';
import {WorkflowError} from '../../../lib/workflow-policy';
import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canEnterLabs} from '../../../lib/lab-execution-policy';
import {readLabWorkspace} from '../../../lib/lab-execution-data';
import {writeLabWorkspace,LabError} from '../../../lib/lab-execution-write';
export const dynamic='force-dynamic';
export async function GET(req:Request){const u=await identity();if(!canEnterLabs(u))return json({error:'دسترسی ندارید.'},403);const type=new URL(req.url).searchParams.get('type')||'internal';if(!['internal','external'].includes(type)||u?.laboratory&&u.laboratoryType!==type)return json({error:'دسترسی به این آزمایشگاه ندارید.'},403);return json(await readLabWorkspace(u,type))}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر.'},403);const u=await identity();if(!canEnterLabs(u))return json({error:'دسترسی ندارید.'},403);if(Number(req.headers.get('content-length')||0)>80000)return json({error:'حجم درخواست زیاد است.'},413);try{const b:any=await req.json();return json(await writeLabWorkspace(u,b,new URL(req.url).origin))}catch(e:any){if(e instanceof LabError||e instanceof WorkflowError||e instanceof SampleCustodyError)return json({error:e.message},e.status);console.error('laboratory mutation failed',e);return json({error:'ذخیره انجام نشد؛ اطلاعات یا نسخه جاری را بررسی کنید.'},500)}}
