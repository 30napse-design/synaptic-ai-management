'use client';
import {useState} from 'react';
import {FlaskConical,Layers3,ClipboardCheck,Clock3,Search,ArrowUpLeft,PackageCheck,CheckCircle2,Truck,Boxes} from 'lucide-react';
import styles from './sample-intake-dashboard.module.css';

type Sample={id:string;project_id:string;invoice_number:string;customer:string;name:string;type:string;category:string;unit:string;quantity:number;amount_per_unit:string;destination:string;created_at:string;state:'registered'|'announced'|'received'|'accepted';announced:number;received:number;accepted:number};
type Filter='all'|'registered'|'announced'|'received'|'accepted';
const labels:{[key:string]:string}={all:'همه نمونه‌ها',registered:'ثبت اولیه',announced:'اعلام ارسال',received:'دریافت پژوهشکده',accepted:'پذیرش‌شده'};
const statIcons={all:Boxes,registered:Layers3,announced:Truck,received:PackageCheck,accepted:CheckCircle2};
const fa=(n:number)=>n.toLocaleString('fa-IR');
export function SampleIntakeHero(){
 return <div className={styles.hero} dir="rtl">
  <span className={styles.heroMark}><FlaskConical size={27}/></span>
  <div className={styles.heroText}><span className={styles.overline}>SYNAPSE / SAMPLE INTAKE</span><h1>پذیرش نمونه محققین</h1><p>ثبت نمونه، کنترل تحویل و پیگیری ارجاع به آزمایشگاه‌های تخصصی</p></div>
  <a className={styles.motherLink} href="/laboratories"><Layers3 size={18}/><span>مدیریت یکپارچه پرونده‌ها و پروژه‌ها</span><ArrowUpLeft size={15}/></a>
 </div>;
}
export function SampleIntakeProgress(){
 return <div className={styles.steps} dir="rtl">
 {['۱. مشخصات و ثبت نمونه','۲. دریافت و کنترل محموله','۳. بررسی و تحویل آزمایشگاه'].map((t,i)=><span key={t} className={i===0?styles.currentStep:''}><span>{i+1}</span>{t}</span>)}
 </div>;
}
export function SampleIntakeRecords({records,onChoose}:{records:Sample[];onChoose:(id:string)=>void}){
 const [filter,setFilter]=useState<Filter>('all'),[query,setQuery]=useState('');
 const counts:{[key:string]:number}={all:records.length,registered:0,announced:0,received:0,accepted:0};
 for(const r of records)counts[r.state]=(counts[r.state]||0)+1;
 const visible=records.filter(r=>(filter==='all'||r.state===filter)&&(!query||[r.id,r.customer,r.invoice_number,r.name,r.type,r.destination].join(' ').toLowerCase().includes(query.trim().toLowerCase())));
 return <section className={styles.records} aria-label="فهرست نمونه‌های ثبت‌شده" dir="rtl" id="registered-samples">
  <div className={styles.recordsHead}><div><h2><Boxes size={23}/> نمونه‌های ثبت‌شده</h2><p>فهرست واقعی نمونه‌های پرونده‌های مجاز؛ آخرین ۱۰۰ قلم، بدون پرونده تکراری</p></div><span className={styles.counter}>{fa(records.length)} قلم</span></div>
  <div className={styles.statusCards}>{(['all','registered','announced','received','accepted'] as Filter[]).map(id=>{
   const Icon=statIcons[id];return <button key={id} type="button" aria-pressed={filter===id} className={styles.statusCard+' '+styles['status_'+id]+(filter===id?' '+styles.selected:'')} onClick={()=>setFilter(id)}><Icon size={19}/><span>{labels[id]}</span><strong>{fa(counts[id]||0)}</strong></button>;
  })}</div>
  <div className={styles.listSearch}><Search size={17}/><input aria-label="جستجو در نمونه‌ها" placeholder="نام محقق، شماره فاکتور، شناسه یا نوع نمونه…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
  <div className={styles.scrollTable}><table><thead><tr><th>شناسه نمونه</th><th>محقق / فاکتور</th><th>نوع و نام نمونه</th><th>مقدار / تعداد</th><th>آزمایشگاه مقصد</th><th>وضعیت واقعی</th><th>اقدام</th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td><bdi>{r.id.slice(0,22)}</bdi></td><td>{r.customer}<small>فاکتور {r.invoice_number}</small></td><td>{r.name}<small>{r.category} / {r.type}</small></td><td>{fa(r.quantity)} {r.unit}{r.amount_per_unit&&<small>هر واحد: {r.amount_per_unit}</small>}</td><td>{r.destination}</td><td><span className={styles.stateBadge+' '+styles['state_'+r.state]}>{labels[r.state]}</span><small>تحویل: {fa(r.received)} · پذیرفته: {fa(r.accepted)}</small></td><td><button type="button" className={styles.viewButton} onClick={()=>onChoose(r.project_id)}>مشاهده پرونده <ArrowUpLeft size={13}/></button><a className={styles.handoffLink} href={'/laboratories?id='+encodeURIComponent(r.project_id)}>تحویل آزمایشگاه</a></td></tr>)}</tbody></table>{!visible.length&&<div className={styles.empty}><ClipboardCheck size={27}/><p>{records.length?'نمونه‌ای مطابق فیلتر پیدا نشد.':'هنوز نمونه‌ای در پرونده‌های قابل مشاهده ثبت نشده است.'}</p></div>}</div>
  <p className={styles.footnote}><Clock3 size={14}/>ثبت نمونه به معنای تحویل به آزمایشگاه نیست. دریافت آزمایشگاه باید با ثبت تحویل مستند و تأیید مسئول مجاز انجام شود.</p>
 </section>;
}
