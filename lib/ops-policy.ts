import {visitPurposes} from './communication-policy.ts';
import {hasAccess} from './auth-policy.ts';
export const operationCategories=[
 {id:'visits',title:'مراجعات حضوری',number:'07',scope:'operations',items:visitPurposes},
 {id:'customers',title:'مشتریان و سفارش‌ها',number:'01',scope:'operations',items:['ثبت سفارش','درخواست اصلاح فاکتور','مشاوره پیش از سفارش','تحویل نمونه']},
 {id:'billing',title:'فاکتورها و پرداخت‌های مشتریان',number:'02',scope:'billing_ops',items:['فاکتورهای ارسال‌شده','پیش‌نویس فاکتور — ارسال‌نشده','واریزی‌های مشتریان','اعلام واریز یا فیش — منتظر تأیید بانک','صورتحساب و مانده پرداخت','مغایرت پرداخت و پیگیری مانده','لغو سفارش و استرداد وجه']},
 {id:'results',title:'نتایج و خدمات علمی',number:'03',scope:'results_ops',items:['نتایج ارسال‌شده','مشاوره و رفع اشکال نتایج','درخواست رفع اشکال و اطلاعات تکمیلی']},
 {id:'projects',title:'پروژه‌ها و آزمایشگاه‌ها',number:'04',scope:'operations',items:['اجرای پروژه و پیگیری آزمایشگاه‌ها']},
 {id:'internal',title:'امور داخلی و اداری',number:'05',scope:'manager',items:['استخدام و همکاری علمی','امور داخلی و مدیریت','تنخواه و هزینه‌های جاری','هزینه‌های خدمات و خرید شرکت']},
 {id:'system',title:'سامانه و سایر موارد',number:'06',scope:'operations',items:['مشکلات سایت و فرم سفارش','اطلاع‌رسانی و تبلیغات','نیازمند بررسی','گزارش روزانه ایمیل‌ها','امنیت حساب و دسترسی سامانه']},
];
export const privateSubtypes=['امنیت حساب و دسترسی سامانه','گزارش روزانه ایمیل‌ها','نیازمند بررسی'];
export const opsStatuses:Record<string,string>={open:'جدید',doing:'در حال پیگیری',waiting:'منتظر پاسخ',review:'نیازمند بررسی',closed:'بسته‌شده'};
export function categoryFor(subtype:string){return operationCategories.find(c=>c.items.includes(subtype))}
export function canSeeOps(user:any,item:any){if(user?.manager)return true;if(!user||item.manager_only||item.managerOnly||item.category==='internal'||privateSubtypes.includes(item.subtype))return false;const c=operationCategories.find(c=>c.id===item.category);return !!c&&hasAccess(user,c.scope)}
export function sensitive(title:string){return /bank\s*statement|statement\s*of\s*account|صورت.?حساب\s*بانک|گردش\s*حساب\s*بانک|one.time\s*(password|code)|verification\s*code|رمز\s*یک.?بار|کد\s*ورود/i.test(title)}
export function validateOpsInput(item:any){const c=categoryFor(item.subtype);return !!c&&c.id===item.category&&typeof item.title==='string'&&item.title.trim().length>0&&item.title.length<=240&&typeof item.sourceBody==='string'&&item.sourceBody.length<=16000&&['gmail','incoming','manual'].includes(item.sourceType)&&(!item.sourceUrl||/^https:\/\//.test(item.sourceUrl))}
