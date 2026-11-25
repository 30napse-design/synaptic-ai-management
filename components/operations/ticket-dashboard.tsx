'use client';
import {Inbox,MailOpen,CalendarClock,Hourglass,ClockAlert,UserRoundX} from 'lucide-react';
import './ticket-dashboard.css';
type Kind='all'|'new'|'today'|'waiting'|'overdue'|'unassigned';
type Props={total:number;newCount:number;today:number;waiting:number;overdue:number;unassigned:number;active:Kind|'';onSelect:(id:Kind)=>void};
const cards=[
 {id:'all',title:'همه تیکت‌ها',Icon:Inbox},
 {id:'new',title:'جدید',Icon:MailOpen},
 {id:'today',title:'پیگیری امروز',Icon:CalendarClock},
 {id:'waiting',title:'منتظر پاسخ',Icon:Hourglass},
 {id:'overdue',title:'موعد گذشته',Icon:ClockAlert},
 {id:'unassigned',title:'بدون مسئول',Icon:UserRoundX},
] as const;
export default function TicketDashboard({total,newCount,today,waiting,overdue,unassigned,active,onSelect}:Props){
 const counts={all:total,new:newCount,today,waiting,overdue,unassigned};
 return <section className="ticket-dashboard" aria-label="وضعیت کارتابل تیکت‌ها" dir="rtl">
  <div className="ticket-dashboard-cards">{cards.map(({id,title,Icon})=><button type="button" key={id} className={'ticket-dashboard-card ticket-card-'+id+(active===id?' is-current':'')} aria-pressed={active===id} onClick={()=>onSelect(id)}>
   <span className="ticket-dashboard-icon"><Icon size={18} aria-hidden="true"/></span>
   <span className="ticket-dashboard-label">{title}</span>
   <strong>{Number(counts[id]||0).toLocaleString('fa-IR')}</strong>
  </button>)}</div>
 </section>;
}
