import {Check} from 'lucide-react';
const labels=['انتخاب دسته','انتخاب موضوع','تکمیل اطلاعات','دریافت کد پیگیری'];
export function WizardProgress({currentStep}:{currentStep:number}){return <ol className="sw-progress" aria-label="مراحل ثبت درخواست">{labels.map((label,i)=><li key={label} aria-current={currentStep===i+1?'step':undefined} data-complete={currentStep>i+1}><span>{currentStep>i+1?<Check size={16}/>:(i+1).toLocaleString('fa-IR')}</span><b>{label}</b></li>)}</ol>}
