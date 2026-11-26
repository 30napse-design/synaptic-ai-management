'use client';
import {useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {initialSupportData,type SupportWizardData} from '../../types/support-wizard';
import {intakeDefaultResponsibility} from '../../lib/unified-intake-taxonomy';
import {validateStep} from '../../lib/validations/support-wizard-validation';
import {WizardProgress} from './WizardProgress';
import {Step1Category} from './Step1Category';
import {Step2Topic} from './Step2Topic';
import {Step3Details} from './Step3Details';
import {SupportChallenge} from './SupportChallenge';
import './support-wizard.css';

type Props={isInternalStaff?:boolean;onCancel?:()=>void;onSaved?:()=>void;publicSiteKey?:string};
type Receipt={id:string;trackingCode:string};
type Upload={file:File;key:string};
type SubmissionResponse={ok?:unknown;id?:unknown;trackingCode?:unknown;error?:unknown};
type Attempt={key:string;data:SupportWizardData;group:string};

export function ResearcherSupportWizard({isInternalStaff=false,onCancel,onSaved,publicSiteKey}:Props){
 const publicLive=!!publicSiteKey&&!isInternalStaff;
 const live=isInternalStaff&&!!onSaved||publicLive;
 const [turnstileToken,setTurnstileToken]=useState('');
 const [challengeVersion,setChallengeVersion]=useState(0);
 const [trackingCode,setTrackingCode]=useState('');
 const [trackingStatus,setTrackingStatus]=useState('');
 const [trackingOpen,setTrackingOpen]=useState(false);
 const [step,setStep]=useState(1);
 const [data,setData]=useState(initialSupportData);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [receipt,setReceipt]=useState<Receipt>();
 const [pendingFiles,setPendingFiles]=useState<Upload[]>([]);
 const [copied,setCopied]=useState(false);
 const currentAttempt=useRef<Attempt>(null);
 const submitting=useRef(false);
 const locked=busy||!!currentAttempt.current;
 const classification=intakeDefaultResponsibility(data.categoryId,data.topicTitle);
 const updateData=(updates:Partial<SupportWizardData>)=>{setData(old=>({...old,...updates}));setError('')};
 const props={data,updateData,isInternalStaff};

 async function uploadFiles(id:string,files:Upload[]){
  for(const [index,{file,key}] of files.entries()){
   try{
    const form=new FormData();
    form.set('ticket_id',id);
    form.set('file',file);
    form.set('upload_key',key);
    const response=await fetch(publicLive?'/api/ticket-support/public/files':'/api/ticket-support/files',{method:'POST',body:form,headers:publicLive?{'x-support-tracking-code':id}:undefined});
    const result=await response.json() as SubmissionResponse|null;
    if(!response.ok||result?.ok!==true)throw new Error(typeof result?.error==='string'?result.error:'پیوست ذخیره نشد.');
    setPendingFiles(files.slice(index+1));
   }catch(err){
    setError('تیکت ثبت شد. پیوست «'+file.name+'» ذخیره نشد. '+(err instanceof Error?err.message:''));
    return;
   }
  }
 }

 async function submit(){
  if(!live||submitting.current)return;
  if(publicLive&&!turnstileToken){setError('بررسی امنیتی را کامل کنید.');return;}
  const message=validateStep(3,data,isInternalStaff);
  if(message||!classification){setError(message||'موضوع معتبر انتخاب کنید.');return;}
  const attempt=currentAttempt.current??{key:crypto.randomUUID(),data,group:classification.group};
  currentAttempt.current=attempt;
  submitting.current=true;
  setBusy(true);
  setError('');
  try{
   const d=attempt.data;
   const response=await fetch(publicLive?'/api/ticket-support/public':'/api/ticket-support',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
     source:publicLive?'site':'direct',turnstileToken,group:attempt.group,category:d.categoryId,topic:d.topicTitle,title:d.topicTitle,
     description:d.description,clientName:d.name,phone:d.mobile,email:d.email,reference:d.orderNumber,
     organization:d.organization,due:d.followUpDate,requestKey:attempt.key
    })
   });
   const result=await response.json() as SubmissionResponse|null;
   if(!response.ok){
    if([400,413].includes(response.status))currentAttempt.current=null;
    throw new Error(typeof result?.error==='string'?result.error:'ثبت درخواست انجام نشد.');
   }
   if(result?.ok!==true||typeof result.id!=='string'||!result.id||typeof result.trackingCode!=='string'||!result.trackingCode){
    throw new Error('پاسخ ثبت معتبر نبود. دوباره تلاش کنید.');
   }
   currentAttempt.current=null;
   setReceipt({id:result.id,trackingCode:result.trackingCode});
   setStep(4);
   const uploads=d.files.map(file=>({file,key:crypto.randomUUID()}));
   setPendingFiles(uploads);
   await uploadFiles(result.id,uploads);
   onSaved?.();
  }catch(err){
   setError(err instanceof Error?err.message:'ثبت درخواست انجام نشد.');
  }finally{
   if(publicLive){setTurnstileToken('');setChallengeVersion(v=>v+1);}
   submitting.current=false;
   setBusy(false);
  }
 }

 async function retryFiles(){
  if(!receipt||submitting.current)return;
  submitting.current=true;
  setError('');
  setBusy(true);
  try{await uploadFiles(receipt.id,pendingFiles);onSaved?.();}
  finally{submitting.current=false;setBusy(false);}
 }

 function next(){
  const message=validateStep(step,data,isInternalStaff);
  setError(message);
  if(message)return;
  if(step===3&&live){void submit();return;}
  setStep(s=>Math.min(4,s+1));
 }

 async function track(event:React.FormEvent){
  event.preventDefault();
  setTrackingStatus('در حال بررسی…');
  try{
   const response=await fetch('/api/ticket-support/public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'track',code:trackingCode.trim()})});
   const result=await response.json() as {status?:string;error?:string};
   setTrackingStatus(response.ok?result.status||'پاسخ نامعتبر است.':result.error||'پیگیری ممکن نشد.');
  }catch{setTrackingStatus('پیگیری ممکن نشد. دوباره تلاش کنید.');}
 }

 function reset(){
  setData(initialSupportData());
  setReceipt(undefined);
  setPendingFiles([]);
  setCopied(false);
  setError('');
  setStep(1);
 }

 return <section className="sw-root" dir="rtl" aria-label="مرکز پشتیبانی پژوهشگر">
  <header className="sw-header">
   <h1>{isInternalStaff?'ثبت داخلی تیکت پشتیبانی':'مرکز پشتیبانی پژوهشگر'}</h1>
   <p>چطور می‌توانیم کمکتان کنیم؟</p>
   {isInternalStaff&&<small>ثبت داخلی سامانه</small>}
  </header>
  <div className="sw-body">
   {publicLive&&<button type="button" onClick={()=>{setTrackingOpen(v=>!v);setTrackingStatus('')}}>{trackingOpen?'بازگشت به ثبت درخواست':'پیگیری درخواست'}</button>}
   {trackingOpen?<form className="sw-fields" onSubmit={track}>
    <label>کد پیگیری<input required maxLength={36} dir="ltr" value={trackingCode} onChange={e=>setTrackingCode(e.target.value)}/></label>
    <button type="submit" className="sw-primary">مشاهده وضعیت</button>
    <p role="status">{trackingStatus}</p>
   </form>:<>
   <WizardProgress currentStep={step}/>
   {error&&<p className="sw-error" role="alert">{error}</p>}
   {step===1&&<div className="sw-start">
    <Step1Category {...props}/>
    <aside className="sw-next-steps" aria-label="راهنمای ارسال درخواست">
     <h2>پس از انتخاب دسته</h2>
     <ol><li>موضوع درخواست و واحد پاسخگو را ببینید.</li><li>اطلاعات تماس و شرح درخواست را بنویسید.</li><li>در صورت نیاز، فایل مرتبط را اضافه کنید.</li><li>درخواست را ثبت کنید و کد پیگیری را نگه دارید.</li></ol>
    </aside>
   </div>}
   {step===2&&<Step2Topic {...props}/>}
   {step===3&&<fieldset disabled={locked} style={{border:0,padding:0,margin:0,minWidth:0}}><Step3Details {...props} live={live}/></fieldset>}
   {step===4&&(receipt?<section className="sw-notice">
    <h2>درخواست با موفقیت ثبت شد</h2>
    <p>واحد پاسخگو {classification?.label}</p>
    {publicLive&&<p>کد پیگیری را برای مشاهده وضعیت درخواست نگه دارید.</p>}
    <p><strong>کد پیگیری </strong><bdi>{receipt.trackingCode}</bdi></p>
    <button type="button" onClick={async()=>{
     try{await navigator.clipboard.writeText(receipt.trackingCode);setCopied(true);}
     catch{setCopied(false);}
    }}>{copied?'کد کپی شد':'کپی کد پیگیری'}</button>
    {pendingFiles.length>0&&<p>{busy?'در حال ذخیره پیوست‌ها…':'تعدادی از پیوست‌ها هنوز ذخیره نشده‌اند.'}</p>}
   </section>:<section><h2>دریافت کد پیگیری</h2>
    <p className="sw-notice" role="status">فرم عمومی در حالت پیش‌نمایش است. اطلاعاتی به سرور ارسال نشده است.</p>
   </section>)}
   {publicLive&&step===3&&<SupportChallenge key={challengeVersion} siteKey={publicSiteKey} onToken={setTurnstileToken}/>}
   <nav className="sw-nav" aria-label="حرکت بین مراحل">
    {!receipt&&<button type="button" disabled={step===1||locked} onClick={()=>{setError('');setStep(s=>Math.max(1,s-1));}}><ChevronRight size={16}/> مرحله قبل</button>}
    {onCancel&&<button type="button" disabled={busy} onClick={onCancel}>بازگشت</button>}
    {step<4&&<button type="button" className="sw-primary" disabled={busy} onClick={next}>
     {busy?'در حال ثبت…':['ادامه و انتخاب موضوع','ادامه و تکمیل اطلاعات درخواست',live?'ثبت درخواست و دریافت کد پیگیری':'مشاهده مرحله دریافت کد پیگیری'][step-1]}<ChevronLeft size={16}/>
    </button>}
    {receipt&&pendingFiles.length>0&&<button type="button" className="sw-primary" disabled={busy} onClick={()=>void retryFiles()}>تلاش مجدد برای پیوست‌ها</button>}
    {receipt&&<button type="button" disabled={busy} onClick={reset}>ثبت درخواست دیگر</button>}
   </nav></>}
  </div>
 </section>;
}
