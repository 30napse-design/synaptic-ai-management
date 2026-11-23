'use client';
import {Inbox,CalendarClock,Hourglass,MailOpen} from 'lucide-react';
import './ticket-dashboard.css';

type Props={
 total:number;
 today:number;
 waiting:number;
 newCount:number;
 active:'all'|'today'|'waiting'|'new'|'';
 onSelect:(id:'all'|'today'|'waiting'|'new')=>void;
};
const stats=[
 {id:'all',title:'همه تیکت‌ها',Icon:Inbox},
 {id:'today',title:'پیگیری امروز',Icon:CalendarClock},
 {id:'waiting',title:'منتظر پاسخ',Icon:Hourglass},
 {id:'new',title:'جدید',Icon:MailOpen},
] as const;
export default function TicketDashboard({total,today,waiting,newCount,active,onSelect}:Props){
 const values={all:total,today,waiting,new:newCount};
 return <section className="ticket-dashboard" aria-label="وضعیت کارتابل تیکت‌ها" dir="rtl">
  <div className="ticket-dashboard-head"><strong>وضعیت کارتابل</strong><span>اطلاعات واقعی و به‌روز سامانه</span></div>
  <div className="ticket-dashboard-cards">{stats.map(({id,title,Icon})=><button type="button" key={id} className={'ticket-dashboard-card ticket-card-'+id+(active===id?' is-current':'')} onClick={()=>onSelect(id)} aria-pressed={active===id}>
   <span className="ticket-dashboard-icon"><Icon size={21}/></span>
   <span className="ticket-dashboard-label">{title}</span>
   <strong>{Number(values[id]||0).toLocaleString('fa-IR')}</strong>
  </button>)}</div>
 </section>;
}
