'use client';
import {useState,type FormEvent} from 'react';
import {communicationChannels,visitPurposes} from '../../lib/communication-policy';
import {communicationModes,messengerChannels,modeTransport,siteCategoriesForAuthorized,matchingLegacySubtype,communicationTranscript} from '../../lib/operations-intake-ui';
import './operations-intake.css';

type Props={form:any;setForm:(value:any)=>void;user:any;allowed:any[];eligible:(record:any)=>any[];busy:boolean;feedback:string;onCancel:()=>void;onSubmit:(payload:any)=>Promise<boolean>};
export default function OperationsIntakeForm({form,setForm,user,allowed,eligible,busy,feedback,onCancel,onSubmit}:Props){
 const [submitting,setSubmitting]=useState(false);
 const cats=siteCategoriesForAuthorized(allowed);
 const cat=cats.find(c=>c.id===form.siteCategory)||cats[0];
 const mode=modeTransport(form.communicationMode||'phone-in');
 const change=(part:any)=>setForm({...form,...part});
 const save=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!form.siteTopic||!form.customerRequest?.trim()||!form.staffResponse?.trim())return;
  const legacy=matchingLegacySubtype(cat.id,form.siteTopic,allowed);
  if(!legacy)return;
  const body=communicationTranscript(form.siteTopic,form.customerRequest,form.staffResponse);
  const title=form.siteTopic+' — '+(form.clientName||form.phone||'درخواست جدید');
  const channel=mode.id==='messaging'?form.channel:mode.channel;
  setSubmitting(true);
  try{await onSubmit({...form,action:'create',subtype:mode.direction==='visit'?form.visitPurpose:legacy,title,sourceBody:body,direction:mode.direction,channel,sourceType:channel==='phone'?'incoming':'manual',isTicket:false})}
  finally{setSubmitting(false)}
 };
 return <form className="ops-intake-form" onSubmit={save}>
  <p className="hint">ثبت‌کننده: {user.name} · فرم مشترک ثبت ارتباط و تماس تلفنی.</p>
  <div className="form-grid">
   <label>نوع ارتباط<select value={mode.id} onChange={e=>{const m=modeTransport(e.target.value);change({communicationMode:m.id,direction:m.direction,channel:m.channel})}}>{communicationModes.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
   {mode.id==='messaging'&&<label>پیام‌رسان<select value={form.channel||'whatsapp'} onChange={e=>change({channel:e.target.value})}>{messengerChannels.map(id=><option value={id} key={id}>{communicationChannels.find(c=>c.id===id)?.name||id}</option>)}</select></label>}
   {mode.id==='visit'&&<label>علت مراجعه<select value={form.visitPurpose} onChange={e=>change({visitPurpose:e.target.value})}>{visitPurposes.map(v=><option key={v}>{v}</option>)}</select></label>}
   <label>دسته اصلی<select required value={cat?.id||''} onChange={e=>change({siteCategory:e.target.value,siteTopic:''})}>{cats.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label>
   <label>موضوع درخواست<select required value={form.siteTopic||''} onChange={e=>change({siteTopic:e.target.value})}><option value="">انتخاب موضوع درخواست</option>{cat?.topics.map(topic=><option value={topic} key={topic}>{topic}</option>)}</select><small>موضوع به دسته اصلی وابسته است.</small></label>
   <label>نام تماس‌گیرنده / مشتری<input required maxLength={160} value={form.clientName} onChange={e=>change({clientName:e.target.value})}/></label>
   <label>شماره تماس<input type="tel" dir="ltr" maxLength={80} value={form.phone} onChange={e=>change({phone:e.target.value})}/></label>
   <label>ایمیل تماس<input type="email" dir="ltr" maxLength={200} value={form.email} onChange={e=>change({email:e.target.value})}/></label>
   <label>شماره فاکتور / سفارش<input maxLength={160} value={form.reference} onChange={e=>change({reference:e.target.value})}/></label>
   <label>دانشگاه / شرکت / سازمان<input maxLength={240} value={form.organization||''} onChange={e=>change({organization:e.target.value})}/></label>
   <label>نام نماینده / شخص رابط<input maxLength={160} value={form.representative||''} onChange={e=>change({representative:e.target.value})}/></label>
   <label>تاریخ تماس / درخواست<input maxLength={80} value={form.callDate||''} onChange={e=>change({callDate:e.target.value})}/></label>
   <label>موعد پیگیری / مهلت پاسخ<input type="date" value={form.due||''} onChange={e=>change({due:e.target.value})}/></label>
   <label className="wide">شرح تماس / درخواست مشتری <span className="required">*</span><textarea required rows={4} maxLength={7000} value={form.customerRequest||''} onChange={e=>change({customerRequest:e.target.value})} placeholder="صحبت‌ها و درخواست مطرح‌شده توسط مخاطب را ثبت کنید…"/></label>
   <label className="wide">پاسخ پشتیبان / اقدام یا قول داده‌شده <span className="required">*</span><textarea required rows={4} maxLength={7000} value={form.staffResponse||''} onChange={e=>change({staffResponse:e.target.value})} placeholder="پاسخ، تعهد یا اقدام بعدی را دقیق ثبت کنید…"/></label>
   <label className="wide">مسئول پیگیری<select value={form.assignee||''} onChange={e=>change({assignee:e.target.value})}><option value="">بعداً تعیین شود</option>{eligible({...form,category:mode.id==='visit'?'visits':undefined}).map(m=><option key={m.email} value={m.email}>{m.name}</option>)}</select></label>
  </div>
  {feedback&&<div className="error-banner">{feedback}</div>}
  <div className="modal-actions"><button className="primary" disabled={busy||submitting||!cat||!form.siteTopic}>{busy||submitting?'در حال ثبت…':'ثبت و ارجاع'}</button><button type="button" className="secondary" disabled={busy||submitting} onClick={onCancel}>انصراف</button></div>
 </form>;
}
