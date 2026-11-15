import {env} from 'cloudflare:workers';
import {db,identity,json,mutationAllowed} from '../../../lib/staff-server';
import {allowedModes,assistantModes,assistantConfig,retrieveKnowledge,AssistantMode} from '../../../lib/assistant-policy';
import {openAIProvider} from '../../../lib/assistant-provider';
import {tariffSuggestions} from '../../../lib/assistant-tariffs';
export const dynamic='force-dynamic';
export async function GET(){const u=await identity();if(!u)return json({error:'ابتدا وارد شوید'},401);const c=assistantConfig(env);return json({connected:c.ready,modes:allowedModes(u).map(id=>({id,label:assistantModes[id]})),retention:'گفت‌وگو فقط تا بستن پنل در حافظه مرورگر نگهداری می‌شود؛ در سامانه ذخیره نمی‌شود.',recordAccess:false})}
// Reserve request allowance atomically using the existing limits table. Fail closed on storage failure.
async function allowance(id:string,max:number){const now=Date.now(),expires=new Date().setUTCHours(24,0,0,0);const r=await db().prepare('INSERT INTO staff_auth_limits(id,count,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END WHERE expires_at<=? OR count<? RETURNING count').bind(id,expires,now,now,now,max).first();return !!r}
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);const u=await identity();if(!u)return json({error:'ابتدا وارد شوید'},401);if(Number(req.headers.get('content-length')||0)>12000)return json({error:'پیام طولانی است'},413);try{const b:any=await req.json(),mode=b.mode as AssistantMode,q=String(b.question||'').trim();if(!allowedModes(u).includes(mode))return json({error:'این حالت برای حساب شما مجاز نیست'},403);if(!q||q.length>2000)return json({error:'پرسش را تا ۲۰۰۰ کاراکتر وارد کنید'},400);const chunks=retrieveKnowledge(q,mode,u),sources=chunks.map(({id,title,version,href})=>({id,title,version,href}));const c=assistantConfig(env);const suggestions=mode==='quote'?tariffSuggestions(q):[];
 if(b.test===true)return json({test:true,connected:c.ready,answer:'نمونه آزمایشی رابط؛ پاسخ مدل هوش مصنوعی نیست.\n'+(chunks.map(x=>x.title+': '+x.text).join('\n')||'منبع تأییدشده‌ای برای این حالت وارد نشده است.'),sources,suggestions});
 if(!c.ready)return json({error:'اتصال مدل فعال نیست؛ از «آزمایش رابط بدون هزینه» استفاده کنید.',connected:false},503);
 if(b.externalConsent!==true)return json({error:'ارسال متن پرسش به ارائه‌دهنده خارجی نیازمند تأیید شماست.'},400);
 const limit=Math.min(c.global,Math.floor(c.budget/c.reserve));if(!await allowance('ai:user:'+u.email,c.daily)||!await allowance('ai:global',limit))return json({error:'سهمیه روزانه تکمیل شده است؛ مدیر باید میزان مصرف را بررسی کند.'},429);
 const result=await openAIProvider((env as any).OPENAI_API_KEY,c.model,c.output).answer({question:q,context:chunks.map(x=>'['+x.id+'] '+x.text).join('\n'),mode});return json({test:false,answer:result.text,sources,suggestions,usage:result.usage});
 }catch{return json({error:'پاسخ دریافت نشد؛ هیچ عملیات اجرایی انجام نشد و درخواست خودکار تکرار نشد.'},503)}}
