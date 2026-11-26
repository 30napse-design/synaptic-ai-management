'use client';
import {useState,type FormEvent} from 'react';
import {communicationChannels,visitPurposes} from '../../lib/communication-policy';
import {unifiedIntakeCategories,intakeDefaultResponsibility,intakeGroupLabel,type IntakeGroupId} from '../../lib/unified-intake-taxonomy';
import {normalizeIranPhone,validOptionalEmail,validPersianContactName} from '../../lib/unified-intake-routing';
import {memberPositionLabel} from '../../lib/ticket-staff-desk';
import {orgRoleCatalog} from '../../lib/org-role-catalog';
import {organizationalCode} from '../../lib/organizational-logins';
import {communicationModes,messengerChannels,modeTransport,siteCategoriesForAuthorized,matchingLegacySubtype,communicationTranscript} from '../../lib/operations-intake-ui';
import './operations-intake.css';

type Props={form:any;setForm:(value:any)=>void;user:any;allowed:any[];eligible:(record:any)=>any[];canCall:boolean;busy:boolean;feedback:string;onCancel:()=>void;onSubmit:(payload:any)=>Promise<boolean>};
export default function OperationsIntakeForm({form,setForm,user,allowed,eligible,canCall,busy,feedback,onCancel,onSubmit}:Props){
 const [submitting,setSubmitting]=useState(false);
 const [requestKey,setRequestKey]=useState(()=>crypto.randomUUID());
 const [validation,setValidation]=useState('');
 const chosen=unifiedIntakeCategories.find(c=>c.id===form.siteCategory);
 const group:IntakeGroupId=form.unifiedGroup||chosen?.group||'services';
 const cats=unifiedIntakeCategories.filter(c=>c.group===group);
 const cat=cats.find(c=>c.id===form.siteCategory)||cats[0];
 const suggested=intakeDefaultResponsibility(cat.id,form.siteTopic);
 const mode=modeTransport(!canCall&&['phone-in','phone-out'].includes(form.communicationMode)?'email-in':form.communicationMode||'phone-in');
 const change=(part:any)=>setForm({...form,...part});
 const changeClassification=(part:any)=>change({...part,assignee:'',assignmentReason:''});
 const save=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!suggested||!form.customerRequest?.trim()||!form.staffResponse?.trim())return;
  if(!validPersianContactName(form.clientName)){setValidation('نام و نام خانوادگی فارسی معتبر وارد کنید.');return}
  if(!validOptionalEmail(form.email||'')){setValidation('ایمیل معتبر نیست.');return}
  if(mode.channel==='phone'&&!normalizeIranPhone(form.phone||'')){setValidation('شماره موبایل ایرانی معتبر وارد کنید.');return}
  if(form.assignee&&String(form.assignmentReason||'').trim().length<4){setValidation('برای ارجاع دستی، دلیل حداقل چهار حرفی بنویسید.');return}
  setValidation('');
  const body='دسته اصلی: '+cat.title+'\n'+communicationTranscript(form.siteTopic,form.customerRequest,form.staffResponse);
  const title=form.siteTopic+' — '+(form.clientName||form.phone||'درخواست جدید');
  const channel=mode.id==='messaging'?form.channel:mode.channel;
  setSubmitting(true);
  try{const ok=await onSubmit({...form,action:'create',sourceKey:'intake:'+requestKey,unifiedCategory:cat.id,unifiedTopic:form.siteTopic,subtype:mode.direction==='visit'?form.visitPurpose:form.siteTopic,title,sourceBody:body,direction:mode.direction,channel,sourceType:channel==='phone'?'incoming':'manual',isTicket:false});if(ok){setRequestKey(crypto.randomUUID());change({clientName:'',phone:'',email:'',reference:'',organization:'',representative:'',customerRequest:'',staffResponse:'',assignee:'',due:''})}}
  finally{setSubmitting(false)}
 };
 return <form className="ops-intake-form" onSubmit={save}>
  <p className="hint">ثبت‌کننده: {user.name}</p>
  <div className="form-grid">
   <label>نوع ارتباط<select value={mode.id} onChange={e=>{const m=modeTransport(e.target.value);change({communicationMode:m.id,direction:m.direction,channel:m.channel})}}>{communicationModes.filter(m=>canCall||m.channel!=='phone').map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
   {mode.id==='messaging'&&<label>پیام‌رسان<select value={form.channel||'whatsapp'} onChange={e=>change({channel:e.target.value})}>{messengerChannels.map(id=><option value={id} key={id}>{communicationChannels.find(c=>c.id===id)?.name||id}</option>)}</select></label>}
   {mode.id==='visit'&&<label>علت مراجعه<select value={form.visitPurpose} onChange={e=>change({visitPurpose:e.target.value})}>{visitPurposes.map(v=><option key={v}>{v}</option>)}</select></label>}
   <label>گروه درخواست<select value={group} onChange={e=>{const next=e.target.value as IntakeGroupId;changeClassification({unifiedGroup:next,siteCategory:unifiedIntakeCategories.find(c=>c.group===next)?.id||'',siteTopic:''})}}><option value="services">{intakeGroupLabel('services')}</option><option value="consultation">{intakeGroupLabel('consultation')}</option></select></label>
   <label>دسته اصلی<select required value={cat?.id||''} onChange={e=>changeClassification({siteCategory:e.target.value,siteTopic:''})}>{cats.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label>
   <label>موضوع درخواست<select required value={form.siteTopic||''} onChange={e=>changeClassification({siteTopic:e.target.value})}><option value="">انتخاب موضوع درخواست</option>{cat?.topics.map(topic=><option value={topic.title} key={topic.title}>{topic.title}</option>)}</select></label>
   <p className="ops-responsibility" role="status"><b>مسئولیت سازمانی: </b>{suggested?.label||([...new Set(cat.topics.map(t=>t.role))].length===1?intakeDefaultResponsibility(cat.id,cat.topics[0].title)?.label:"وابسته به موضوع")}<small> · در ارجاع خودکار، درخواست به کارتابل مسئول فعال این سمت می‌رود.</small></p>
   <label>مسئول پیگیری<select disabled={!suggested} value={form.assignee||''} onChange={e=>change({assignee:e.target.value})}><option value="">ارجاع خودکار براساس موضوع</option>{suggested&&eligible({...form,subtype:form.siteTopic,category:'customers',routing:{ownerRole:'unified_pending_'+(suggested?.role||'unknown'),unifiedIntake:suggested},channel:mode.id==='messaging'?form.channel:mode.channel,sourceType:mode.channel==='phone'?'incoming':'manual'}).map(m=><option key={m.email} value={m.email}>{memberPositionLabel(m,orgRoleCatalog,organizationalCode)}</option>)}</select></label>
   {form.assignee&&<label>دلیل انتخاب مسئول پیگیری<input required minLength={4} maxLength={500} value={form.assignmentReason||''} onChange={e=>change({assignmentReason:e.target.value})} placeholder="علت ارجاع به این کارمند مجاز"/></label>}
   <label>نام تماس‌گیرنده / مشتری<input required maxLength={160} value={form.clientName} onChange={e=>change({clientName:e.target.value})}/></label>
   <label>شماره تماس<input type="tel" dir="ltr" maxLength={80} value={form.phone} onChange={e=>change({phone:e.target.value})}/></label>
   <label>ایمیل تماس<input type="email" dir="ltr" maxLength={200} value={form.email} onChange={e=>change({email:e.target.value})}/></label>
   <label className="ops-intake-reference">شماره فاکتور / سفارش<input maxLength={160} value={form.reference} onChange={e=>change({reference:e.target.value})}/></label>
   <label className="ops-transcript"><span>شرح تماس / درخواست مشتری <span className="required">*</span></span><textarea required rows={3} maxLength={7000} value={form.customerRequest||''} onChange={e=>change({customerRequest:e.target.value})} placeholder="صحبت‌ها و درخواست مطرح‌شده توسط مخاطب را ثبت کنید…"/></label>
   <label className="ops-transcript"><span>پاسخ پشتیبان / اقدام یا قول داده‌شده <span className="required">*</span></span><textarea required rows={3} maxLength={7000} value={form.staffResponse||''} onChange={e=>change({staffResponse:e.target.value})} placeholder="پاسخ، تعهد یا اقدام بعدی را دقیق ثبت کنید…"/></label>
   <details className="wide ops-intake-extra"><summary>اطلاعات تکمیلی و موعد پیگیری</summary><div className="form-grid">
   <label>دانشگاه / شرکت / سازمان<input maxLength={240} value={form.organization||''} onChange={e=>change({organization:e.target.value})}/></label>
   <label>نام نماینده / شخص رابط<input maxLength={160} value={form.representative||''} onChange={e=>change({representative:e.target.value})}/></label>
   <label>تاریخ تماس / درخواست<input maxLength={80} value={form.callDate||''} onChange={e=>change({callDate:e.target.value})}/></label>
   <label>موعد پیگیری / مهلت پاسخ<input type="date" value={form.due||''} onChange={e=>change({due:e.target.value})}/></label>
   </div></details>
  </div>
  {(feedback||validation)&&<div className="error-banner" role="alert">{validation||feedback}</div>}
  <div className="modal-actions"><button className="primary" disabled={busy||submitting||!cat||!form.siteTopic}>{busy||submitting?'در حال ثبت…':'ثبت و ارجاع'}</button><button type="button" className="secondary" disabled={busy||submitting} onClick={onCancel}>انصراف</button></div>
 </form>;
}
