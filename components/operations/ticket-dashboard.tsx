'use client';
import {Inbox,MailOpen,CalendarClock,Hourglass,AlarmClock,UserRoundX} from 'lucide-react';
import './ticket-dashboard.css';
type Key='all'|'new'|'today'|'waiting'|'overdue'|'unassigned';
type Props={total:number;newCount:number;today:number;waiting:number;overdue:number;unassigned:number;active:Key|'';onSelect:(id:Key)=>void};
const cards=[
 {id:'all',label:'همه تیکت‌ها',Icon:Inbox},
 {id:'new',label:'جدید',Icon:MailOpen},
 {id:'today',label:'پیگیری امروز',Icon:CalendarClock},
 {id:'waiting',label:'منتظر پاسخ',Icon:Hourglass},
 {id:'overdue',label:'موعد گذشته',Icon:AlarmClock},
 {id:'unassigned',label:'بدون مسئول',Icon:UserRoundX}
] as const;
export default function TicketDashboard({total,newCount,today,waiting,overdue,unassigned,active,onSelect}:Props){
 const counts={all:total,new:newCount,today,waiting,overdue,unassigned};
 return <section className="ticket-dashboard" aria-label="وضعیت کارتابل تیکت‌ها" dir="rtl">
  <div className="ticket-dashboard-cards">{cards.map(({id,label,Icon})=><button type="button" key={id} className={'ticket-dashboard-card ticket-card-'+id+(active===id?' is-current':'')} aria-pressed={active===id} onClick={()=>onSelect(id)}>
   <Icon size={17} aria-hidden="true"/><span>{label}</span><strong>{Number(counts[id]||0).toLocaleString('fa-IR')}</strong>
  </button>)}</div>
 </section>;
}
