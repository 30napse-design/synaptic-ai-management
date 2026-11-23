'use client';
import {Search} from 'lucide-react';
import {siteTicketCategories} from '../../lib/ticket-support-taxonomy';
import {memberPositionLabel} from '../../lib/ticket-staff-desk';
import {orgRoleCatalog} from '../../lib/org-role-catalog';
import {organizationalCode} from '../../lib/organizational-logins';
import './ticket-staff-filters.css';

type Props={
 origin:string;setOrigin:(v:string)=>void;
 query:string;setQuery:(v:string)=>void;
 category:string;setCategory:(v:string)=>void;
 topic:string;setTopic:(v:string)=>void;
 assignee:string;setAssignee:(v:string)=>void;
 members:any[];count:number;reset:()=>void;
};
export default function TicketStaffFilters({origin,setOrigin,query,setQuery,category,setCategory,topic,setTopic,assignee,setAssignee,members,count,reset}:Props){
 const current=siteTicketCategories.find(x=>x.id===category);
 const accounts=members.filter(m=>m.manager||Boolean(organizationalCode(m.username||'')));
 const labeled=accounts.map(m=>({...m,position:memberPositionLabel(m,orgRoleCatalog,organizationalCode)}));
 const options=labeled.map(m=>({...m,duplicate:labeled.filter(n=>n.position===m.position).length>1}));
 return <section className="ticket-staff-panel" aria-label="فیلترهای تیکت و پشتیبانی کارکنان" dir="rtl">
  <div className="ticket-staff-heading">
   <div><strong>جست‌وجو و فیلتر تیکت‌ها</strong></div>
   <div className="ticket-staff-source"><label>منبع تیکت
    <select value={origin} onChange={e=>setOrigin(e.target.value)}>
     <option value="">همه منابع</option><option value="legacy">Gmail و پیام‌های قبلی</option>
     <option value="site">تیکت‌های سایت</option><option value="direct">ثبت مستقیم سامانه</option>
    </select></label></div>
  </div>
  <label className="ticket-staff-search"><Search size={18}/><input aria-label="جستجوی تیکت" placeholder="نام محقق، شماره فاکتور، موبایل یا ایمیل…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="ticket-staff-grid">
   <label>دسته اصلی<select aria-label="دسته اصلی تیکت" value={category} onChange={e=>{setCategory(e.target.value);setTopic('')}}><option value="">همه دسته‌ها</option>{siteTicketCategories.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <label>موضوع درخواست<select aria-label="موضوع درخواست تیکت" value={topic} disabled={!current} onChange={e=>setTopic(e.target.value)}><option value="">همه موضوعات</option>{current?.topics.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
   <label>مسئول تیکت<select aria-label="مسئول تیکت" value={assignee} onChange={e=>setAssignee(e.target.value)}><option value="">همه مسئولان</option>{options.map(m=><option key={m.email} value={m.email}>{m.position}{m.duplicate?' — '+m.email:''}</option>)}</select></label>
  </div>
  <button type="button" className="ticket-staff-clear" onClick={reset}>پاک‌کردن فیلترها</button>
 </section>;
}
