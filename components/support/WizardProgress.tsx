import {Check} from 'lucide-react';
const labels=['انتخاب دسته','انتخاب موضوع','تکمیل اطلاعات','دریافت کد پیگیری'];
export function WizardProgress({currentStep,received=false}:{currentStep:number;received?:boolean}){return <ol className="sw-progress" aria-label="مراحل ثبت درخواست">{labels.map((label,i)=><li key={label} aria-current={currentStep===i+1?'step':undefined} data-complete={(currentStep>i+1||received)}><span>{(currentStep>i+1||received)?<Check size={12}/>:(i+1).toLocaleString('fa-IR')}</span><b>{label}</b></li>)}</ol>}
