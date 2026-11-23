'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {CalendarDays,ClipboardList,ShieldCheck,Mail,Inbox,AlarmClock,Hourglass,UserRoundX,CheckCircle2,ChevronRight,ChevronLeft,ArrowUpLeft,Plus,Clock3,Layers3} from 'lucide-react';
import {isWork,participant,isOverdue,executionDay,calendarDays} from '../../lib/work-policy';
import './work-command-dashboard.css';
import WorkCorrespondenceStrip from './work-correspondence-strip';
import MyResponsibilities from './my-responsibilities';
type Props={data:any;today:string;open:(r:any)=>void;create:(kind:string,date?:string)=>void;manager:boolean};
const number=(n:number)=>n.toLocaleString('fa-IR');
const pretty=(s:string)=>new Intl.DateTimeFormat('fa-IR',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Dubai'}).format(new Date(s+'T12:00:00Z'));
const shift=(s:string,n:number)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const states:{[key:string]:string}={todo:'برای انجام',doing:'در حال انجام',blocked:'منتظر دیگران',review:'منتظر تأیید',changes:'نیازمند اصلاح',done:'تکمیل‌شده'};
export default function WorkCommandDashboard({data,today,open,create,manager}:Props){
 const [metric,setMetric]=useState('all'),[section,setSection]=useState('tasks'),[anchor,setAnchor]=useState(today),[scope,setScope]=useState('mine'),[query,setQuery]=useState(''),[board,setBoard]=useState('todo');
 const visible=(data.records||[]).filter((r:any)=>isWork(r));
 const mine=visible.filter((r:any)=>participant(r,data.user));
 const current=manager&&scope==='all'?visible:mine;
 const stats={
  all:current.length,new:current.filter((r:any)=>r.status==='todo').length,
  today:current.filter((r:any)=>executionDay(r)===today).length,
  waiting:current.filter((r:any)=>['blocked','review','changes'].includes(r.status)).length,
  overdue:current.filter((r:any)=>isOverdue(r,today)).length,
  unassigned:manager?visible.filter((r:any)=>!r.assignee&&r.status!=='done').length:0,
 };
 const filtered=useMemo(()=>[...(metric==='unassigned'&&manager?visible:current)].filter((r:any)=>{
  const ok=metric==='all'||metric==='new'&&r.status==='todo'||metric==='today'&&executionDay(r)===today||metric==='waiting'&&['blocked','review','changes'].includes(r.status)||metric==='overdue'&&isOverdue(r,today)||metric==='unassigned'&&!r.assignee;
  return ok&&(!query||[r.title,r.ref,r.body].join(' ').toLowerCase().includes(query.toLowerCase()));
 }).sort((a:any,b:any)=>String(b.updated_at||b.updatedAt||'').localeCompare(String(a.updated_at||a.updatedAt||''))).slice(0,50),[metric,current,visible,manager,query,today]);
 const cards=[{id:'all',label:'همه وظایف',Icon:Inbox},{id:'new',label:'جدید',Icon:Layers3},{id:'today',label:'امروز',Icon:CalendarDays},{id:'waiting',label:'منتظر اقدام',Icon:Hourglass},{id:'overdue',label:'موعد گذشته',Icon:AlarmClock},...(manager?[{id:'unassigned',label:'بدون مسئول',Icon:UserRoundX}]:[])];
 const menu=[{id:'plans',title:'برنامه‌ریزی',note:'تقویم و برنامه‌های روزانه و آتی',Icon:CalendarDays},{id:'tasks',title:'کارتابل وظایف',note:'امروز، همه وظایف و برد',Icon:ClipboardList},{id:'approvals',title:'بررسی و تأیید',note:'درخواست‌های منتظر تصمیم',Icon:ShieldCheck},{id:'mail',title:'مکاتبات داخلی',note:'دریافتی، ارسالی و تاریخچه',Icon:Mail}];
 const week=calendarDays(anchor,'week');
 const byDay=(d:string)=>mine.filter((r:any)=>executionDay(r)===d);
 const approvals=visible.filter((r:any)=>r.status==='review'&&(manager||r.reviewer===data.user.email));
 const todayItems=mine.filter((r:any)=>executionDay(r)===today).slice(0,6);
 const shortName=(email:string)=>{const x=(data.members||[]).find((m:any)=>m.email===email);return x?.name?.split(' | ')[0]||'بدون مسئول'};
 return <div className="work-command" dir="rtl">
  <header className="work-command-heading"><div><span>SYNAPSE / WORKSPACE</span><h1>کارتابل و برنامه‌ریزی</h1><p>برنامه‌ها، وظایف، تأییدیه‌ها و مکاتبات در یک نمای منظم</p></div><Link href="/staff?view=plans" className="work-command-header-link"><CalendarDays size={17}/>تقویم کامل</Link></header>
  <nav className="work-command-modules" aria-label="چهار بخش اصلی کارتابل">{menu.map(({id,title,note,Icon})=><button type="button" aria-pressed={section===id} onClick={()=>setSection(id)} key={id} className={'work-command-module module-'+id+(section===id?' active':'')}><Icon size={27}/><span><b>{title}</b><small>{note}</small></span><ArrowUpLeft size={16}/></button>)}</nav>
  <section className="work-command-metrics" aria-label="آمار واقعی وظایف">{cards.map(({id,label,Icon})=><button type="button" key={id} className={'work-command-metric metric-'+id+(metric===id?' selected':'')} aria-pressed={metric===id} onClick={()=>{setSection('tasks');setMetric(id)}}><Icon size={19}/><span>{label}</span><strong>{number(stats[id as keyof typeof stats]||0)}</strong></button>)}</section>
  {section==='tasks'&&<div className="work-command-main">
   <aside className="work-command-calendar"><header><button aria-label="هفته قبل" onClick={()=>setAnchor(shift(anchor,-7))}><ChevronRight size={17}/></button><b>{pretty(anchor)}</b><button aria-label="هفته بعد" onClick={()=>setAnchor(shift(anchor,7))}><ChevronLeft size={17}/></button></header><div className="work-command-week">{week.map(d=><button key={d} className={d===anchor?'selected':''} onClick={()=>setAnchor(d)}><small>{new Intl.DateTimeFormat('fa-IR',{weekday:'short',timeZone:'Asia/Dubai'}).format(new Date(d+'T12:00:00Z'))}</small><strong>{new Intl.DateTimeFormat('fa-IR',{day:'numeric',timeZone:'Asia/Dubai'}).format(new Date(d+'T12:00:00Z'))}</strong><i>{byDay(d).length||''}</i></button>)}</div><div className="work-command-day"><div><b>برنامه {pretty(anchor)}</b>{manager&&<button onClick={()=>create('plan',anchor)} aria-label="ثبت برنامه"><Plus size={17}/></button>}</div>{byDay(anchor).slice(0,6).map((r:any)=><button key={r.id} onClick={()=>open(r)}><span>{r.title}</span><small>{states[r.status]||r.status}</small></button>)}{!byDay(anchor).length&&<p>برنامه‌ای برای این روز ثبت نشده است.</p>}</div><Link href="/staff?view=plans">مشاهده تقویم کامل <ArrowUpLeft size={14}/></Link></aside>
   <section className="work-command-taskspace"><header><h2>وظایف من</h2><div><button onClick={()=>{setMetric('today');setSection('tasks')}}>امروز من</button><button onClick={()=>setMetric('all')}>همه وظایف</button><Link href="/staff?view=board">برد کامل</Link></div></header>
    <div className="work-command-tools"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی عنوان یا شماره پرونده…"/>{manager&&<select value={scope} onChange={e=>setScope(e.target.value)} aria-label="دامنه نمایش"><option value="mine">وظایف من</option><option value="all">همه وظایف مجاز</option></select>}</div>
    <div className="work-command-board">{[['todo','برای انجام'],['doing','در حال انجام'],['blocked','منتظر دیگران'],['done','تکمیل‌شده']].map(([id,title])=><div key={id} className={'work-command-column col-'+id}><button className="work-command-colhead" onClick={()=>setBoard(id)} aria-pressed={board===id}><strong>{title}</strong><small>{number(filtered.filter((r:any)=>r.status===id).length)}</small></button><div>{filtered.filter((r:any)=>r.status===id).slice(0,4).map((r:any)=><button type="button" className="work-command-item" key={r.id} onClick={()=>open(r)}><b>{r.title}</b><small>{shortName(r.assignee)} · {r.due||'بدون موعد'}</small></button>)}{!filtered.some((r:any)=>r.status===id)&&<p>موردی ثبت نشده است.</p>}</div></div>)}</div>
    <div className="work-command-list"><header><b>فهرست وظایف {metric==='today'?'امروز':'اخیر'}</b><span>{number(filtered.length)} مورد از رکوردهای مجاز</span></header>{filtered.map((r:any)=><button key={r.id} onClick={()=>open(r)}><span><b>{r.title}</b><small>{r.ref||r.id} · {shortName(r.assignee)}</small></span><span className={'work-command-state status-'+r.status}>{states[r.status]||r.status}</span></button>)}{!filtered.length&&<p>موردی مطابق این فیلتر یافت نشد.</p>}</div>
   </section>
  </div>}
  {section==='plans'&&<section className="work-command-section"><header><h2>برنامه‌ریزی روزانه و آینده</h2><Link href="/staff?view=plans">تقویم روزانه، هفتگی و ماهانه <ArrowUpLeft size={15}/></Link></header><div className="work-command-week">{week.map(d=><button key={d} className={d===anchor?'selected':''} onClick={()=>setAnchor(d)}><small>{new Intl.DateTimeFormat('fa-IR',{weekday:'short',timeZone:'Asia/Dubai'}).format(new Date(d+'T12:00:00Z'))}</small><strong>{new Intl.DateTimeFormat('fa-IR',{day:'numeric',timeZone:'Asia/Dubai'}).format(new Date(d+'T12:00:00Z'))}</strong></button>)}</div>{manager&&<button className="work-command-create" onClick={()=>create('plan',anchor)}><Plus size={16}/> ثبت برنامه برای {pretty(anchor)}</button>}{byDay(anchor).map((r:any)=><button className="work-command-line" key={r.id} onClick={()=>open(r)}>{r.title} <span>{states[r.status]}</span></button>)}{!byDay(anchor).length&&<p>برای این تاریخ برنامه‌ای ثبت نشده است.</p>}</section>}
  {section==='approvals'&&<section className="work-command-section"><header><h2>بررسی و تأیید</h2><Link href="/staff?view=approvals">همه درخواست‌های تأیید <ArrowUpLeft size={15}/></Link></header><p>{number(approvals.length)} مورد در انتظار بررسی مجاز شما</p>{approvals.slice(0,50).map((r:any)=><button className="work-command-line" key={r.id} onClick={()=>open(r)}>{r.title}<span>منتظر تصمیم</span></button>)}{!approvals.length&&<p>درخواست تأییدی وجود ندارد.</p>}</section>}
  {section==='mail'&&<section className="work-command-section"><header><h2>مکاتبات داخلی</h2><Link href="/work/mail">مشاهده دریافتی، ارسالی و تاریخچه <ArrowUpLeft size={15}/></Link></header><p>مکاتبات سازمانی از سامانه اصلی و با مجوزهای واقعی خوانده می‌شوند. در این نما، مکاتبه یا مسئول ساختگی ایجاد نمی‌شود.</p><Link className="work-command-create" href="/work/mail">ورود به دفتر مکاتبات داخلی</Link></section>}
  <details className="work-command-responsibilities"><summary>نقش و مسئولیت‌های سازمانی من</summary><MyResponsibilities user={data.user} organization={data.organization}/></details>
  <WorkCorrespondenceStrip/>
  <footer className="work-command-foot"><Clock3 size={14}/> آمار بر اساس داده‌های مجاز حساب شماست. رکوردهای قدیمی بدون تغییر و بدون انتساب جدید باقی می‌مانند.</footer>
 </div>;
}
