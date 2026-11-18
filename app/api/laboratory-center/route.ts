import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {readLaboratoryCenter,writeLaboratoryCenter} from '../../../lib/laboratory-center';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{return json(await readLaboratoryCenter(await identity(),new URL(req.url).searchParams))}catch(e:any){return json({error:e.status?e.message:'خواندن مرکز آزمایشگاه ممکن نشد.'},e.status||500)}}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر است.'},403);try{const raw=await req.text();if(raw.length>400000)return json({error:'حجم درخواست زیاد است.'},413);return json(await writeLaboratoryCenter(await identity(),JSON.parse(raw),new URL(req.url).origin))}catch(e:any){if(!e.status)console.error('laboratory-center unexpected failure');return json({error:e.status?e.message:'ثبت انجام نشد؛ نسخه و اطلاعات را بررسی کنید.'},e.status||400)}}
