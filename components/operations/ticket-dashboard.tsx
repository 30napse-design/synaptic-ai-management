'use client';
import {Inbox,CalendarClock,Hourglass,MailOpen,ClockAlert,UserRoundX} from 'lucide-react';
import './ticket-dashboard.css';

export type TicketDeskStat='all'|'new'|'today'|'waiting'|'overdue'|'unassigned';
type Props={
 total:number;today:number;waiting:number;newCount:number;overdue:number;unassigned:number;
 active:TicketDeskStat|'';onSelect:(id:TicketDeskStat)=>void;
};
const stats=[
 {id:'all',title:'همه تیکت‌ها',Icon:Inbox},
 {id:'new',title:'جدید',Icon:MailOpen},
 {id:'today',title:'پیگیری امروز',Icon:CalendarClock},
 {id:'waiting',title:'منتظر پاسخ',Icon:Hourglass},
 {id:'overdue',title:'موعد گذشته',Icon:ClockAlert},
 {id:'unassigned',title:'بدون مسئول',Icon:UserRoundX},
] as const;
export default function TicketDashboard({total,today,waiting,newCount,overdue,unassigned,active,onSelect}:Props){
 const values={all:total,new:newCount,today,waiting,overdue,unassigned};
 return <section className="ticket-dashboard" aria-label="وضعیت کارتابل تیکت‌ها" dir="rtl">
  <div className="ticket-dashboard-head"><strong>وضعیت کارتابل</strong><span>آخرین وضعیت واقعی درخواست‌های مجاز</span></div>
  <div className="ticket-dashboard-cards">{stats.map(({id,title,Icon})=><button type="button" key={id} className={'ticket-dashboard-card ticket-card-'+id+(active===id?' is-current':'')} onClick={()=>onSelect(id)} aria-pressed={active===id}>
   <span className="ticket-dashboard-icon"><Icon size={17}/></span>
   <span className="ticket-dashboard-label">{title}</span>
   <strong>{Number(values[id]||0).toLocaleString('fa-IR')}</strong>
  </button>)}</div>
 </section>;
}
