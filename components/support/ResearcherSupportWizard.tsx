'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {initialSupportData,type SupportWizardData} from '../../types/support-wizard';
import {intakeDefaultResponsibility} from '../../lib/unified-intake-taxonomy';
import {validateStep} from '../../lib/validations/support-wizard-validation';
import {ticketSourceOptions} from '../../lib/ticket-sources-mapping';
import {WizardProgress} from './WizardProgress';
import {Step1Category} from './Step1Category';
import {Step2Topic} from './Step2Topic';
import {Step3Details} from './Step3Details';
import './support-wizard.css';
export function ResearcherSupportWizard({isInternalStaff=false,onCancel}:{isInternalStaff?:boolean;onCancel?:()=>void}){
 const [step,setStep]=useState(1),[data,setData]=useState(initialSupportData),[error,setError]=useState('');
 const updateData=(updates:Partial<SupportWizardData>)=>{setData(old=>({...old,...updates}));setError('')};
 const classification=intakeDefaultResponsibility(data.categoryId,data.topicTitle);
 const source=ticketSourceOptions.find(x=>x.id===(isInternalStaff?'direct':'site'));
 const props={data,updateData,isInternalStaff};
 const next=()=>{const message=validateStep(step,data,isInternalStaff);setError(message);if(!message)setStep(s=>Math.min(4,s+1))};
 const back=()=>{setError('');setStep(s=>Math.max(1,s-1))};
 return <section className="sw-root" dir="rtl" aria-label="مرکز پشتیبانی پژوهشگر"><header className="sw-header"><h1>چطور می‌توانیم کمکتان کنیم؟</h1><p>مرکز پشتیبانی و مشاوره تخصصی پژوهشکده سلول و بافت هوشمند</p>{isInternalStaff&&<small>پیش‌نمایش داخلی — {source?.label}</small>}</header><div className="sw-body"><WizardProgress currentStep={step}/>{error&&<p className="sw-error" role="alert">{error}</p>}
 {step===1&&<Step1Category {...props}/>}
 {step===2&&<Step2Topic {...props}/>}
 {step===3&&<Step3Details {...props}/>}
 {step===4&&<section><h2>بررسی و تأیید اطلاعات</h2><dl className="sw-review">{[['دسته',classification?.categoryLabel],['موضوع',classification?.topic],['واحد پاسخگو',classification?.label],['نام',data.name],['موبایل',data.mobile],['ایمیل',data.email],['دانشگاه / سازمان',data.organization],['شماره فاکتور / سفارش',data.orderNumber],['شرح درخواست',data.description],...(isInternalStaff?[['موعد پیگیری',data.followUpDate]]:[]),['پیوست‌ها',data.files.map(f=>f.name).join('، ')],['منبع',source?.label]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'—'}</dd></div>)}</dl><p className="sw-notice" role="status">این فرم پیش‌نمایش است. ثبت نهایی، ارسال فایل و دریافت کد رهگیری پس از اتصال امن API در TKT-04 فعال می‌شود. هیچ اطلاعاتی ارسال نشده است.</p><button type="button" className="sw-primary" disabled>تأیید و ثبت نهایی درخواست</button></section>}
 <nav className="sw-nav" aria-label="حرکت بین مراحل"><button type="button" disabled={step===1} onClick={back}><ChevronRight size={16}/> مرحله قبل</button>{onCancel&&<button type="button" onClick={onCancel}>بستن پیش‌نمایش</button>}{step<4&&<button type="button" className="sw-primary" onClick={next}>{['ادامه و انتخاب موضوع','ادامه و تکمیل اطلاعات درخواست','بررسی و ثبت درخواست'][step-1]}<ChevronLeft size={16}/></button>}</nav></div></section>
}
