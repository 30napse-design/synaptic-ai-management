import {intakeDefaultResponsibility,intakeCategory} from '../unified-intake-taxonomy.ts';
import {normalizeIranPhone,validOptionalEmail,validPersianContactName} from '../unified-intake-routing.ts';
import {validDay} from '../operations-date-filter.ts';
import type {SupportWizardData} from '../../types/support-wizard';
const formats:Record<string,string[]>={pdf:['application/pdf'],doc:['application/msword'],docx:['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],png:['image/png'],jpg:['image/jpeg'],jpeg:['image/jpeg']};
export const maxFiles=5,maxFileBytes=8*1024*1024;
export function validateFiles(files:readonly Pick<File,'name'|'size'|'type'>[]):string{
 if(files.length>maxFiles)return 'حداکثر ۵ فایل مجاز است.';
 for(const f of files){const ext=f.name.split('.').pop()?.toLowerCase()||'';if(!formats[ext]||f.type&&!formats[ext].includes(f.type))return 'فرمت فایل مجاز نیست: '+f.name;if(f.size<=0||f.size>maxFileBytes)return 'حجم فایل باید بین یک بایت و ۸ مگابایت باشد: '+f.name}
 return '';
}
export function validateStep(step:number,d:SupportWizardData,internal=false):string{
 if(!intakeCategory(d.categoryId))return 'لطفاً دسته معتبر انتخاب کنید.';
 if(step===1)return '';
 if(!intakeDefaultResponsibility(d.categoryId,d.topicTitle))return 'موضوع معتبر این دسته را انتخاب کنید.';
 if(step===2)return '';
 if(!validPersianContactName(d.name))return 'نام و نام خانوادگی را کامل وارد کنید.';
 if(!normalizeIranPhone(d.mobile))return 'شماره موبایل ایرانی معتبر وارد کنید.';
 if(!d.email.trim()||!validOptionalEmail(d.email.trim()))return 'ایمیل معتبر الزامی است.';
 if(!d.description.trim()||d.description.length>16000)return 'شرح درخواست را تا ۱۶۰۰۰ نویسه تکمیل کنید.';
 if(d.orderNumber.length>160||d.organization.length>240)return 'شماره مرجع یا نام سازمان بیش از حد طولانی است.';
 if(internal&&d.followUpDate&&!validDay(d.followUpDate))return 'موعد پیگیری معتبر نیست.';
 return validateFiles(d.files);
}
export function selectCategory(d:SupportWizardData,id:string):Partial<SupportWizardData>{return d.categoryId===id?{}:{categoryId:id,topicTitle:''}}
