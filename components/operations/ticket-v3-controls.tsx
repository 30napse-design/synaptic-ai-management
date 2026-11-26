'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,ShieldCheck,CalendarDays,FlaskConical,Settings,ChartNoAxesColumn,MessageCircle,Layers,Info} from 'lucide-react';
import {intakeResponsibleRoles,responsibilityCategories,responsibilityTopics} from '../../lib/unified-intake-taxonomy';
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
const researchAreas=[
 {id:'orders',label:'خدمات پژوهشی',Icon:FlaskConical,categories:['service_orders']},
 {id:'projects',label:'اجرای پروژه',Icon:Settings,categories:['service_projects']},
 {id:'results',label:'نتایج',Icon:ChartNoAxesColumn,categories:['service_results']},
 {id:'consultation',label:'مشاوره تخصصی',Icon:MessageCircle,categories:['consult_before','consult_change','consult_execution','consult_results']},
];

export function ResponsibilityArea({role,category,topic,group,onTopic,onArea}:{role:string;category:string;topic:string;group:string;onTopic:(category:string,topic:string)=>void;onArea:(categories:string[],group:string)=>void}){
 const [expanded,setExpanded]=useState(false);
 const label=intakeResponsibleRoles.find(r=>r.id===role)?.label;
 if(!label)return <section className="v3-responsibility" dir="rtl"><h3>حوزه مسئولیت سازمانی</h3><p>برای دیدن موضوعات و پیام‌های هر واحد، مسئولیت آن را از فهرست انتخاب کنید.</p></section>;
 const categories=responsibilityCategories(role);
 const areas=role==='senior_research'?researchAreas:categories.map(c=>({id:c.id,label:c.title,Icon:Layers,categories:[c.id]}));
 const count=categories.reduce((n,c)=>n+responsibilityTopics(role,c).length,0);
 return <section className="v3-responsibility" dir="rtl">
  <header><h3><Layers size={20}/> حوزه مسئولیت {label}</h3><button type="button" className="v3-role-description" aria-expanded={expanded} aria-controls="v3-role-full-description" onClick={()=>setExpanded(v=>!v)}><Info size={16}/>{expanded?'بستن شرح مسئولیت‌ها':'مشاهده شرح کامل مسئولیت‌ها'}</button></header>
  <p>{role==='senior_research'?'نظارت بر هفت دسته پژوهشی شامل سفارش، اجرای پروژه، نتایج و مشاوره':role==='director'?'نظارت عالی بر تمام دسته‌ها':'موضوعات اجرایی مرتبط با این مسئولیت'} · {fa(count)} موضوع</p>
  <div className="v3-topics">{areas.map(({id,label,Icon,categories:ids})=><button key={id} type="button" aria-pressed={ids.length===1?category===ids[0]:group==='consultation'&&!category} onClick={()=>onArea(ids,ids.length>1?'consultation':'')}><Icon size={17}/>{label}</button>)}</div>
  {expanded&&<div id="v3-role-full-description" className="v3-role-full-description">{categories.map(c=><section key={c.id}><h4>{c.title}</h4><ul>{responsibilityTopics(role,c).map(t=><li key={t.title}><button type="button" aria-pressed={category===c.id&&topic===t.title} onClick={()=>onTopic(c.id,t.title)}>{t.title}</button></li>)}</ul></section>)}</div>}
 </section>;
}
