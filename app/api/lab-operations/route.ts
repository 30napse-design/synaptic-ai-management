import {identity,db,json,mutationAllowed} from '../../../lib/staff-server';
import {hasAccess} from '../../../lib/auth-policy';
import {readLabData} from '../../../lib/lab-data';
import {canCoordinate} from '../../../lib/lab-execution-policy';
import {writeLabWorkspace,LabError} from '../../../lib/lab-execution-write';
export async function GET(req:Request){const u=await identity();if(!u||u.laboratory||!hasAccess(u,'lab'))return json({error:'دسترسی ندارید'},403);if(new URL(req.url).searchParams.get('finance')==='1')return json({error:'مرجع دریافت و پرداخت، بخش مالی و قراردادها است.'},409);return json(await readLabData(u))}
// Compatibility route delegates to the same writer; legacy monetary/status edits cannot bypass it.
export async function POST(req:Request){
 if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);const u=await identity();if(!canCoordinate(u))return json({error:'نقش هماهنگی اجرا لازم است.'},403);
 try{
  const b:any=await req.json();if(!['create','update'].includes(b.action))return json({error:'عملیات معتبر نیست.'},400);
  const old=b.action==='update'?await db().prepare('SELECT * FROM laboratory_jobs WHERE id=?').bind(String(b.id||'')).first<any>():null;
  if(b.action==='update'&&!old)return json({error:'سفارش پیدا نشد.'},404);
  if(['price','paid','cost','vendor_paid'].some(k=>b[k]!==undefined&&b[k]!==Number(old?.[k]||0)))return json({error:'ثبت مالی فقط از اسناد و تراکنش‌های بخش مالی انجام می‌شود.'},409);
  if(b.status&&b.status!==(old?.status||'received'))return json({error:'ثبت شروع اجرا و نتیجه از صفحه آزمایشگاه و نسخه پذیرفته‌شده انجام می‌شود.'},409);
  return json(await writeLabWorkspace(u,{...b,action:'job_save',id:old?.id,laboratory_id:b.laboratory_id||old?.laboratory_id,scientific_contact:b.scientific_contact??old?.scientific_contact??'',instructions:b.instructions??old?.instructions??b.notes??''},new URL(req.url).origin));
 }catch(e:any){if(e instanceof LabError)return json({error:e.message},e.status);return json({error:'ثبت انجام نشد؛ مرجع مالی یا نسخه سفارش را بررسی کنید.'},409)}
}
