'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Mail,Inbox,Send,Clock3,ArrowUpLeft,RefreshCw} from 'lucide-react';
import './work-correspondence-strip.css';
type Ticket={id:string;title:string;assignee:string;created_by:string;created_at:string;request_state:string;routing?:{centerTicket?:{sender_role?:string;target?:string}}};
const states:Record<string,string>={routed:'ارجاع‌شده',waiting_internal:'منتظر پاسخ داخلی',waiting_customer:'منتظر پاسخ مشتری',waiting_approval:'منتظر تأیید',closed:'بسته',awaiting_assignment:'منتظر تخصیص'};
export default function WorkCorrespondenceStrip(){
 const [data,setData]=useState<{tickets:Ticket[];user:{email:string}}|null>(null),[error,setError]=useState(''),[tab,setTab]=useState('all');
 async function load(){try{const r=await fetch('/api/internal-tickets',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error||'خطای دریافت');setData(d);setError('')}catch(e:any){setError(e.message||'دریافت اطلاعات ممکن نشد.')}}
 useEffect(()=>{void load()},[]);
 const records=[...(data?.tickets||[])].sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
 const filtered=records.filter(t=>tab==='all'||tab==='inbox'&&t.assignee===data?.user.email||tab==='sent'&&t.created_by===data?.user.email||tab==='waiting'&&t.request_state.startsWith('waiting_')).slice(0,7);
 return <section className="work-correspondence" dir="rtl" aria-label="آخرین تیکت‌ها و مکاتبات مجاز">
 <header><div><Mail size={18}/><strong>تیکت‌ها و مکاتبات اخیر</strong></div><Link href="/work/mail">دفتر کامل مکاتبات <ArrowUpLeft size={14}/></Link></header>
 <nav>{[['all','همه'],['inbox','دریافتی‌ها'],['sent','ارسالی‌ها'],['waiting','منتظر پاسخ']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)} className={tab===id?'current':''}>{label}</button>)}<button aria-label="به‌روزرسانی" onClick={()=>void load()}><RefreshCw size={14}/></button></nav>
 {error&&<p className="work-correspondence-error" role="status">مکاتبات در دسترس نیستند: {error} <Link href="/work/mail">ورود به دفتر مکاتبات</Link></p>}
 {!data&&!error&&<p>در حال دریافت مکاتبات مجاز…</p>}
 {data&&<div className="work-correspondence-table"><table><thead><tr><th>عنوان</th><th>وضعیت</th><th>منبع</th><th>تاریخ</th></tr></thead><tbody>{filtered.map(t=><tr key={t.id}><td><Link href="/work/mail">{t.title||'مکاتبه بدون عنوان'}</Link><small>{t.id}</small></td><td><span>{states[t.request_state]||t.request_state}</span></td><td>{t.created_by===data.user.email?<Send size={13}/>:<Inbox size={13}/>} {t.created_by===data.user.email?'ارسالی':'دریافتی'}</td><td><Clock3 size={12}/> {t.created_at?.slice(0,10)||'—'}</td></tr>)}</tbody></table>{!filtered.length&&<p>موردی در این دسته یافت نشد.</p>}</div>}
 <small>فقط مکاتبات دارای مجوز نمایش داده می‌شوند. اصل پیام و پیوست‌ها در دفتر مکاتبات حفظ می‌شوند.</small>
 </section>;
}
