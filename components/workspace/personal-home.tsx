import {Home,CalendarDays,ArrowLeft,ChevronLeft,ClipboardList,ClipboardCheck,Clock3,Target,CalendarClock,Bell,Plus,Layers,Search,Info,Leaf,FlaskConical,Users,FileCheck2} from 'lucide-react';
import {workspacePreviews} from '../../lib/navigation';
import {hasAccess} from '../../lib/auth-policy';
import {workStatuses} from '../../lib/work-policy';
const fa=(n:number)=>n.toLocaleString('fa-IR');
const date=(s:string)=>{const value=new Date(s+'T12:00:00Z');return Number.isFinite(value.getTime())?new Intl.DateTimeFormat('fa-IR',{dateStyle:'long',timeZone:'Asia/Dubai'}).format(value):'تاریخ نیازمند بررسی'};
const href=(r:any)=>'/staff?id='+encodeURIComponent(r.id);
const ranks:Record<string,string>={normal:'عادی',high:'بالا',urgent:'فوری'};
function Empty({children}:{children:React.ReactNode}){return <div className="home-v2-empty"><span aria-hidden="true">—</span><p>{children}</p></div>}
export default function PersonalHome({u,d,message}:{u:any,d:any,message:string[]}){
 const {priorities,nextPlan,counts}=d.dashboard,notice=d.importantNotification;
 const quick=[
 {label:'ثبت تماس',Icon:Plus,tone:'blue',href:'/operations?new=call',hint:'ثبت ورودی تماس'},
 ...(u.manager?[{label:'ثبت وظیفه',Icon:ClipboardCheck,tone:'green',href:'/staff?view=all&new=task',hint:'ثبت و ارجاع وظیفه'}]:[{label:'وظایف من',Icon:ClipboardCheck,tone:'green',href:'/staff?view=all',hint:'مشاهده کارهای ارجاع‌شده'}]),
 {label:'برنامه امروز',Icon:CalendarDays,tone:'blue',href:'/staff?view=plans',hint:'برنامه و تقویم من'},
 {label:'درخواست مشتری',Icon:Layers,tone:'purple',href:'/operations?new=request',hint:'ثبت درخواست مشتری'},
 ];
 const previews=workspacePreviews(u);
 return <main className="home-v2" dir="rtl">
  <div className="home-v2-intro">
   <section className="home-v2-heading"><div><span className="home-v2-icon blue"><Home size={27}/></span><h1>خانه من</h1></div><p className="home-v2-date"><CalendarDays size={15}/>{date(d.todayKey)}</p><p className="home-v2-greeting">مرکز پیگیری درخواست‌ها، وظایف و پرونده‌های پژوهشکده</p></section>
   <section className="home-v2-motivation" aria-label="پیام انگیزشی امروز"><img src="/home/mountain-sunrise.png" alt="" className="home-v2-mountain"/><div className="home-v2-quote"><span className="home-v2-leaf" aria-hidden="true"><Leaf size={31}/></span><div><h2>{message[0]}</h2><p>{message[1]}</p></div></div></section>
  </div>

  <section className="home-v2-stats" aria-label="خلاصه کارهای من">{[{label:'اولویت امروز',n:counts.today,description:'کارهای مهم و برنامه‌ریزی‌شده',Icon:ClipboardList,tone:'green',href:'/staff?view=overview'},{label:'تصمیم منتظر',n:counts.decisions,description:'در انتظار بررسی و تأیید شما',Icon:ClipboardCheck,tone:'orange',href:'/staff?view=approvals'},{label:'موعدگذشته',n:counts.overdue,description:'نیازمند اقدام و پیگیری',Icon:Clock3,tone:'red',href:'/staff?view=all&scope=mine&filter=overdue'}].map(s=><a href={s.href} key={s.label} className={'home-v2-stat '+s.tone}><span className={'home-v2-icon '+s.tone}><s.Icon size={27}/></span><div><strong>{fa(s.n)}</strong><b>{s.label}</b><small>{s.description}</small></div><ChevronLeft size={18}/></a>)}</section>
  {d.operationsOverview&&<section className="home-operational-board" aria-label="وضعیت واقعی پذیرش و ارتباطات">
   <header><div><h2>وضعیت زنده عملیات و ارتباطات</h2><p>آمار واقعی در محدوده دسترسی شما، از Gmail و تماس‌های ثبت‌شده؛ نمایش بدون تغییر داده‌ها</p></div><a href="/operations">مشاهده پرونده‌ها <ChevronLeft size={16}/></a></header>
   <div className="home-operational-cards">{[
    {key:'all',label:'کل ارتباطات',tone:'sky',href:'/operations'},
    {key:'new',label:'جدید',tone:'violet',href:'/operations?status=open'},
    {key:'doing',label:'در حال پیگیری',tone:'blue',href:'/operations?status=doing'},
    {key:'waiting',label:'منتظر بررسی / پاسخ',tone:'amber',href:'/operations?status=waiting'},
    {key:'unassigned',label:'بدون مسئول',tone:'rose',href:'/operations?followup=unassigned'},
    {key:'closed',label:'بسته‌شده',tone:'mint',href:'/operations?status=closed'}
   ].map(c=><a href={c.href} key={c.key} className={'home-operational-metric '+c.tone}><span>{c.label}</span><b>{fa(d.operationsOverview[c.key]||0)}</b><ChevronLeft size={14}/></a>)}</div>
   <footer><span>Gmail: <b>{fa(d.operationsOverview.gmail)}</b></span><span>تماس‌های ورودی: <b>{fa(d.operationsOverview.incoming)}</b></span><span>مسئولیت‌ها و وضعیت‌ها از سوابق اصلی خوانده می‌شوند</span></footer>
  </section>}
  <div className="home-v2-body">
   <div className="home-v2-main">
    <section className="home-v2-panel home-v2-priorities"><div className="home-v2-section-title"><h2><span className="home-v2-icon purple"><Target size={23}/></span>اولویت‌های من</h2><a href="/staff?view=all&scope=mine">مشاهده همه<ChevronLeft size={15}/></a></div>
    {priorities.length?<div className="home-v2-task-list">{priorities.map((r:any)=><a key={r.id} href={href(r)} className={'home-v2-task priority-'+r.priority}><span className="home-v2-task-icon">{r.kind==='scientific'?<FlaskConical size={25}/>:r.collaborators?.length?<Users size={25}/>:<FileCheck2 size={25}/>}</span><div><b>{r.title}</b><small>اولویت {ranks[r.priority]||'عادی'}{r.startTime?' · ساعت '+r.startTime:''}{r.due?' · موعد '+(r.due===d.todayKey?'امروز':date(r.due)):''}</small></div><span className={'home-v2-status status-'+r.status}>{workStatuses[r.status]||r.status}</span><ChevronLeft size={17}/></a>)}</div>:<Empty>اولویت بازی برای امروز ندارید. از «وظایف» کارهای مجاز خود را مرور کنید.</Empty>}</section>
    <section className="home-v2-panel home-v2-quick"><div className="home-v2-section-title"><h2><span className="home-v2-icon blue"><Plus size={23}/></span>دسترسی سریع</h2><small><Info size={14}/>متناسب با نقش و سطح دسترسی شما</small></div><div className="home-v2-shortcuts">{quick.filter(q=>q.label!=='عملیات'||hasAccess(u,'operations')).map(q=><a href={q.href} key={q.label} className={q.tone} aria-label={q.hint}><q.Icon size={32}/><b>{q.label}</b></a>)}</div><details className="home-domain-menu"><summary>دسترسی به بخش‌های سامانه</summary><section className="workspace-previews" aria-label="حوزه‌های اصلی سامانه">{previews.map((group,index)=><a key={group.id} href={group.href} className="workspace-preview"><span className="workspace-preview-icon" aria-hidden="true">{index===0?<Users/>:index===1?<ClipboardList/>:index===2?<FlaskConical/>:index===3?<Layers/>:index===4?<FileCheck2/>:<Target/>}</span><h2>{group.title}</h2><p>{group.description}</p><div className="workspace-preview-links">{group.links.map(link=><span key={link.href}>{link.label}</span>)}</div></a>)}</section></details></section>
   </div>
   <div className="home-v2-secondary">
    <section className="home-v2-panel home-v2-next"><div className="home-v2-section-title"><h2><span className="home-v2-icon blue"><CalendarDays size={23}/></span>برنامه بعدی</h2></div>{nextPlan?<a href={href(nextPlan)} className="home-v2-note blue"><span className="home-v2-icon blue"><CalendarClock size={25}/></span><div><b>{nextPlan.title}</b><small><Clock3 size={13}/>{date(nextPlan.scheduledDate||nextPlan.due)}{nextPlan.startTime?' · '+nextPlan.startTime+(nextPlan.endTime?' تا '+nextPlan.endTime:''):''}</small>{nextPlan.unit&&<small>{nextPlan.unit}</small>}</div><ChevronLeft size={17}/></a>:<Empty>برنامهٔ دیگری در پیش ندارید.<a href="/staff?view=plans">مشاهده تقویم<ArrowLeft size={14}/></a></Empty>}</section>
    <section className="home-v2-panel home-v2-notice"><div className="home-v2-section-title"><h2><span className="home-v2-icon orange"><Bell size={23}/></span>اعلان مهم</h2></div>{notice?<a href={'/staff?id='+encodeURIComponent(notice.record_id)} className="home-v2-note purple"><div><b>{notice.body}</b><small>{new Intl.DateTimeFormat('fa-IR',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Dubai'}).format(new Date(notice.created_at))}</small></div><ChevronLeft size={17}/></a>:<Empty>اعلان خوانده‌نشده‌ای برای شما وجود ندارد.</Empty>}</section>

    <div className="home-v2-campus" aria-hidden="true"><img src="/home/research-campus.png" alt=""/><p>پژوهشکده<br/><b>سیناپس</b></p></div>
   </div>
  </div>
 </main>
}
