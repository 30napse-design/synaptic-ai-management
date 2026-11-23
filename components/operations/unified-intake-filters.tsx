'use client';
import {Search,Filter} from 'lucide-react';
import {unifiedIntakeCategories,intakeCategory,intakeGroupLabel,type IntakeGroupId} from '../../lib/unified-intake-taxonomy';
import './operations-staff-filters.css';
type Props={
 query:string;setQuery:(s:string)=>void;
 group:string;setGroup:(s:string)=>void;
 category:string;setCategory:(s:string)=>void;
 topic:string;setTopic:(s:string)=>void;
 owner:string;setOwner:(s:string)=>void;
 status:string;setStatus:(s:string)=>void;
 members:any[];counts?:Record<string,number>;
 reset:()=>void;
};
const statuses={open:'جدید',doing:'در حال پیگیری',waiting:'منتظر پاسخ',review:'در انتظار تأیید',closed:'بسته‌شده'};
export function UnifiedIntakeFilters({query,setQuery,group,setGroup,category,setCategory,topic,setTopic,owner,setOwner,status,setStatus,members,counts,reset}:Props){
 const categories=unifiedIntakeCategories.filter(c=>!group||c.group===group);
 const selected=intakeCategory(category);
 const number=(n:number)=>Number(n||0).toLocaleString('fa-IR');
 return <section dir="rtl" className="ops-staff-filters" aria-label="فیلتر مشترک پذیرش و تیکت">
  <header><Filter size={17}/><div><strong>جست‌وجو و پیگیری ارتباطات</strong><small>فیلترها روی اطلاعات ثبت‌شده سامانه اجرا می‌شوند.</small></div></header>
  <label className="ops-staff-search"><Search size={18}/><input aria-label="جستجو بر اساس نام فاکتور موبایل و ایمیل" placeholder="نام محقق، فاکتور یا سفارش، موبایل یا ایمیل…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <div className="ops-staff-fields">
   <label>گروه درخواست<select value={group} onChange={e=>{setGroup(e.target.value);setCategory('');setTopic('')}}><option value="">هر دو گروه</option><option value="services">{intakeGroupLabel('services')}</option><option value="consultation">{intakeGroupLabel('consultation')}</option></select></label>
   <label>دسته اصلی<select value={category} onChange={e=>{setCategory(e.target.value);setTopic('')}}><option value="">همه دسته‌ها</option>{categories.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
   <label>موضوع<select disabled={!selected} value={topic} onChange={e=>setTopic(e.target.value)}><option value="">همه موضوعات</option>{selected?.topics.map(t=><option key={t.title} value={t.title}>{t.title}</option>)}</select></label>
   <label>مسئول واقعی<select value={owner} onChange={e=>setOwner(e.target.value)}><option value="">همه مسئولان</option>{members.map(m=><option key={m.email} value={m.email}>{m.name||m.email}</option>)}</select></label>
   <label>وضعیت<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">همه وضعیت‌ها</option>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
  </div>
  <div className="ops-unified-chips" aria-label="دسته‌های قابل فیلتر">{categories.map(c=><button type="button" key={c.id} aria-pressed={category===c.id} className={category===c.id?'selected':''} onClick={()=>{setCategory(category===c.id?'':c.id);setTopic('')}}>{c.title} <small>{number(counts?.[c.id]||0)}</small></button>)}</div>
  <div className="ops-staff-foot"><small>تعدادها فقط از رکوردهای ثبت‌شده و مجاز محاسبه می‌شوند.</small><button type="button" onClick={reset}>پاک‌کردن فیلترها</button></div>
 </section>;
}
