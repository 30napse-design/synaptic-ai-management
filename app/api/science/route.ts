import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canScience} from '../../../lib/science-policy';
import {readScienceData} from '../../../lib/science-data';
import {writeScience,ScienceError} from '../../../lib/science-write';
export const dynamic='force-dynamic';
export async function GET(){const u=await identity();if(!canScience(u))return json({error:'دسترسی علمی ندارید.'},403);try{return json(await readScienceData(u))}catch(e){console.error(e);return json({error:'دریافت پرونده‌های علمی ممکن نشد.'},500)}}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر.'},403);const u=await identity();if(!canScience(u))return json({error:'دسترسی علمی ندارید.'},403);try{const raw=await req.text();if(raw.length>400000)return json({error:'حجم درخواست زیاد است.'},413);return json(await writeScience(u,JSON.parse(raw),new URL(req.url).origin))}catch(e:any){if(e instanceof ScienceError)return json({error:e.message},e.status);console.error('science write failed',e);return json({error:'ثبت انجام نشد؛ اطلاعات یا نسخه جاری را بررسی کنید.'},400)}}
