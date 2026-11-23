'use client';
import {Search,Filter} from 'lucide-react';
import {siteTicketCategories,directTicketCategories} from '../../lib/ticket-support-taxonomy';
import {legacyCategoryForSite} from '../../lib/operations-intake-ui';
import {memberPositionLabel} from '../../lib/ticket-staff-desk';
import {orgRoleCatalog} from '../../lib/org-role-catalog';
import {organizationalCode} from '../../lib/organizational-logins';
import './operations-staff-filters.css';

type Props={query:string;setQuery:(v:string)=>void;group:string;setGroup:(v:string)=>void;topic:string;setTopic:(v:string)=>void;owner:string;setOwner:(v:string)=>void;members:any[];allowed:{id:string;items:string[]}[];reset:()=>void};
const directLegacy:Record<string,string>={collaboration:'internal',proposal:'projects',organization:'internal',general:'system'};
export function operationsCategoryId(key:string){const [origin,id]=key.split(':');return origin==='site'?legacyCategoryForSite[id]||'':origin==='direct'?directLegacy[id]||'':'';}
export function OperationsStaffFilters({query,setQuery,group,setGroup,topic,setTopic,owner,setOwner,members,allowed,reset}:Props){
 const available=(id:string)=>allowed.some(a=>a.id===id&&a.items?.length);
 const groups=[...siteTicketCategories.filter(c=>available(legacyCategoryForSite[c.id])).map(c=>({key:'site:'+c.id,name:c.title,topics:c.topics,section:'پذیرش و مشتریان'})),...directTicketCategories.filter(c=>available(directLegacy[c.id])).map(c=>({key:'direct:'+c.id,name:c.title,topics:c.topics,section:'همکاری و درخواست‌های مستقیم'}))];
 const selected=groups.find(g=>g.key===group);
 return <section dir="rtl" className="ops-staff-filters" aria-label="فیلترهای پذیرش و ارتباطات">
 <header><Filter size={17}/><div><strong>جست‌وجو و پیگیری ارتباطات</strong><small>فیلترهای واحد پذیرش و درخواست‌های سازمانی</small></div></header>
 <label className="ops-staff-search"><Search size={18}/><input aria-label="جستجو بر اساس محقق و فاکتور" placeholder="نام محقق، شماره فاکتور، موبایل یا ایمیل…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="ops-staff-fields"><label>دسته اصلی<select value={group} onChange={e=>{setGroup(e.target.value);setTopic('')}}><option value="">همه دسته‌ها</option><optgroup label="پذیرش و مشتریان">{groups.filter(g=>g.section==='پذیرش و مشتریان').map(g=><option key={g.key} value={g.key}>{g.name}</option>)}</optgroup><optgroup label="همکاری و درخواست‌های مستقیم">{groups.filter(g=>g.section!=='پذیرش و مشتریان').map(g=><option key={g.key} value={g.key}>{g.name}</option>)}</optgroup></select></label>
 <label>موضوع درخواست<select value={topic} disabled={!selected} onChange={e=>setTopic(e.target.value)}><option value="">همه موضوعات</option>{selected?.topics.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
 <label>مسئول پیگیری<select value={owner} onChange={e=>setOwner(e.target.value)}><option value="">همه مسئولان</option>{members.filter(m=>m.manager||!!organizationalCode(m.username||'')).map(m=><option key={m.email} value={m.email}>{memberPositionLabel(m,orgRoleCatalog,organizationalCode)}</option>)}</select></label></div>
 <div className="ops-staff-foot"><small>موضوعات جدید برای سوابق قدیمی فقط در صورت تطابق دقیق نمایش داده می‌شوند.</small><button type="button" onClick={reset}>پاک‌کردن فیلترها</button></div>
 </section>;
}
