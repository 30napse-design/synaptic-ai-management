import {identity,json,mutationAllowed} from '../../../lib/staff-server';
import {canPetty} from '../../../lib/petty-policy';
import {pettyData,writePetty,PettyError} from '../../../lib/petty-server';
export const dynamic='force-dynamic';
export async function GET(){const u=await identity();if(!canPetty(u))return json({error:'دسترسی تنخواه ندارید.'},403);return json(await pettyData(u))}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر.'},403);const u=await identity();if(!canPetty(u))return json({error:'دسترسی تنخواه ندارید.'},403);try{const raw=await req.text();if(raw.length>30000)return json({error:'حجم درخواست زیاد است.'},413);return json(await writePetty(u,JSON.parse(raw)))}catch(e:any){return json({error:e instanceof PettyError?e.message:'ثبت انجام نشد؛ اطلاعات را بررسی کنید.'},e instanceof PettyError?e.status:400)}}
