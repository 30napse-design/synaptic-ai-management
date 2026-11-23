'use client';
import {Search,TicketCheck,Filter} from 'lucide-react';
import {siteTicketCategories} from '../../lib/ticket-support-taxonomy';
import {memberPositionLabel} from '../../lib/ticket-staff-desk';
import {orgRoleCatalog} from '../../lib/org-role-catalog';
import {organizationalCode} from '../../lib/organizational-logins';
import './ticket-staff-filters.css';

type Props={
 query:string;setQuery:(v:string)=>void;
 category:string;setCategory:(v:string)=>void;
 topic:string;setTopic:(v:string)=>void;
 assignee:string;setAssignee:(v:string)=>void;
 members:any[];count:number;reset:()=>void;
};
export default function TicketStaffFilters({query,setQuery,category,setCategory,topic,setTopic,assignee,setAssignee,members,count,reset}:Props){
 const current=siteTicketCategories.find(x=>x.id===category);
 return <section className="ticket-staff-panel" aria-label="کارتابل کارکنان تیکت و پشتیبانی" dir="rtl">
  <div className="ticket-staff-heading">
   <span className="ticket-staff-heading-icon"><TicketCheck size={21}/></span>
   <div><strong>کارتابل پیگیری تیکت‌ها</strong><small>جست‌وجو، دسته‌بندی و ارجاع درخواست‌های ثبت‌شده</small></div>
   <span className="ticket-staff-total">{count.toLocaleString('fa-IR')} تیکت</span>
  </div>
  <label className="ticket-staff-search"><Search size={18}/><input aria-label="جستجوی تیکت" placeholder="نام محقق، شماره فاکتور، موبایل یا ایمیل…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="ticket-staff-filter-title"><Filter size={15}/>فیلترهای تیکت</div>
  <div className="ticket-staff-grid">
   <label>دسته اصلی<select aria-label="دسته اصلی تیکت" value={category} onChange={e=>{setCategory(e.target.value);setTopic('')}}><option value="">همه دسته‌ها</option>{siteTicketCategories.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
   <label>موضوع درخواست<select aria-label="موضوع درخواست تیکت" value={topic} disabled={!current} onChange={e=>setTopic(e.target.value)}><option value="">همه موضوعات</option>{current?.topics.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
   <label>مسئول تیکت<select aria-label="مسئول تیکت" value={assignee} onChange={e=>setAssignee(e.target.value)}><option value="">همه مسئولان</option>{members.map(m=><option key={m.email} value={m.email}>{memberPositionLabel(m,orgRoleCatalog,organizationalCode)}</option>)}</select></label>
  </div>
  <button type="button" className="ticket-staff-clear" onClick={reset}>پاک‌کردن فیلترها</button>
 </section>;
}
