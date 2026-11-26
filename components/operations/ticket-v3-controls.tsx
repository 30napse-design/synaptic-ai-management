'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,ShieldCheck,CalendarDays} from 'lucide-react';
import {intakeResponsibleRoles,unifiedIntakeCategories,seniorResearchMayReview} from '../../lib/unified-intake-taxonomy';
import {tehranDay} from '../../lib/operations-date-filter';
import './ticket-dashboard.css';
const fa=(n:number)=>n.toLocaleString('fa-IR');
const dayShift=(s:string,n:number)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const pf=new Intl.DateTimeFormat('en-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'});
const parts=(s:string)=>Object.fromEntries(pf.formatToParts(new Date(s+'T12:00:00Z')).map(p=>[p.type,Number(p.value)]));
const monthStart=(s:string)=>dayShift(s,1-parts(s).day);
const monthTitle=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'long'});
export function TicketCalendar({selected,onDay,onAll}:{selected:string;onDay:(v:string)=>void;onAll:()=>void}){
 const today=tehranDay(),[month,setMonth]=useState(()=>monthStart(selected||today));
 const start=monthStart(month),p=parts(start),days:string[]=[];
 for(let i=0;i<32;i++){const d=dayShift(start,i),x=parts(d);if(x.month!==p.month||x.year!==p.year)break;days.push(d)}
 const blanks=(new Date(start+'T12:00:00Z').getUTCDay()+1)%7;
 return <section className="v3-calendar" dir="rtl" aria-label="تقویم شمسی تاریخ دریافت">
 <header><button type="button" aria-label="ماه قبل" onClick={()=>setMonth(monthStart(dayShift(start,-1)))}><ChevronRight size={16}/></button><b><CalendarDays size={15}/>{monthTitle.format(new Date(start+'T12:00:00Z'))}</b><button type="button" aria-label="ماه بعد" onClick={()=>setMonth(monthStart(dayShift(start,days.length)))}><ChevronLeft size={16}/></button></header>
 <div className="v3-calendar-grid">{['ش','ی','د','س','چ','پ','ج'].map(d=><small key={d}>{d}</small>)}{Array.from({length:blanks},(_,i)=><span key={'blank'+i}/>)}{days.map(d=><button type="button" key={d} aria-pressed={selected===d} aria-current={d===today?'date':undefined} aria-label={new Intl.DateTimeFormat('fa-IR',{dateStyle:'full',timeZone:'Asia/Tehran'}).format(new Date(d+'T12:00:00Z'))} onClick={()=>onDay(d)}>{fa(parts(d).day)}</button>)}</div>
 <footer><button type="button" onClick={()=>{setMonth(monthStart(today));onDay(today)}}>امروز</button><button type="button" onClick={onAll}>همه تاریخ‌ها</button></footer>
 </section>
}
export function RoleSidebar({selected,counts,onSelect}:{selected:string;counts:Record<string,number>|null;onSelect:(v:string)=>void}){
 const [expanded,setExpanded]=useState(false);
 return <aside className={'v3-role-sidebar'+(expanded?' expanded':'')} dir="rtl"><h2><ShieldCheck size={17}/>فیلتر تیکت‌ها براساس مسئولیت‌های سازمانی</h2><button type="button" className="v3-role-toggle" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>نمایش مسئولیت‌ها</button><div className="v3-role-options">{[{id:'',label:'همه مسئولیت‌ها'},...intakeResponsibleRoles].map(r=><button type="button" key={r.id} aria-pressed={selected===r.id} onClick={()=>onSelect(r.id)}><span>{r.label}</span><small>{counts?fa(counts[r.id||'all']??0):'—'}</small></button>)}</div></aside>
}
export function ResponsibilityArea({role,category,topic,onTopic}:{role:string;category:string;topic:string;onTopic:(category:string,topic:string)=>void}){
 const [expanded,setExpanded]=useState(false);
 const label=intakeResponsibleRoles.find(r=>r.id===role)?.label;
 if(!label)return null;
 const oversight=role==='director'||role==='senior_research';
 const categories=unifiedIntakeCategories.filter(c=>role==='director'||role==='senior_research'&&seniorResearchMayReview(c.id)||c.topics.some(t=>t.role===role));
 const topics=categories.flatMap(c=>c.topics.filter(t=>oversight||t.role===role).map(t=>({category:c.id,title:t.title})));
 return <section className="v3-responsibility" dir="rtl"><header><h3>حوزه مسئولیت {label}</h3><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'بستن جزئیات':'مشاهده تمام موضوعات'}</button></header>{oversight&&<p>حوزه نظارت؛ مجوز دسترسی و ارجاع مستقل است.</p>}<div className="v3-topics">{(expanded?topics:topics.slice(0,5)).map(t=><button key={t.category+':'+t.title} type="button" aria-pressed={category===t.category&&topic===t.title} onClick={()=>onTopic(t.category,t.title)}>{t.title}</button>)}</div></section>
}
