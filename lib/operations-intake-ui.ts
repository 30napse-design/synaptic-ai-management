/** A presentation mapping for the approved operations intake screen.
 * Existing persisted categories/subtypes remain authoritative for routing/RBAC.
 * Exact selected user-facing topics are appended to the conversation record.
 */
import {siteTicketCategories} from './ticket-support-taxonomy';
export const communicationModes=[
 {id:'phone-in',title:'تماس ورودی',direction:'inbound',channel:'phone'},
 {id:'phone-out',title:'تماس خروجی',direction:'outbound',channel:'phone'},
 {id:'visit',title:'مراجعه حضوری',direction:'visit',channel:'manual'},
 {id:'email-in',title:'ایمیل دریافتی',direction:'inbound',channel:'gmail'},
 {id:'email-out',title:'ایمیل ارسالی',direction:'outbound',channel:'gmail'},
 {id:'messaging',title:'پیام‌رسان‌ها',direction:'inbound',channel:'whatsapp'},
] as const;
export const messengerChannels=['whatsapp','telegram','bale','rubika','instagram','linkedin'] as const;
export function modeFromTransport(direction:string,channel:string){
 if(direction==='visit')return 'visit';
 if(channel==='phone')return direction==='outbound'?'phone-out':'phone-in';
 if(channel==='gmail')return direction==='outbound'?'email-out':'email-in';
 return 'messaging';
}
export function modeTransport(id:string){return communicationModes.find(m=>m.id===id)||communicationModes[0];}
export const legacyCategoryForSite:Record<string,string>={
 orders:'customers',invoices:'billing',payments:'billing',results:'results',
 projects:'projects',internal:'internal',system:'system',
};
export function siteCategoriesForAuthorized(allowed:Array<{id:string;items:string[]}>) {
 return siteTicketCategories.filter(c=>allowed.some(a=>a.id===legacyCategoryForSite[c.id]&&a.items?.length));
}
export function matchingLegacySubtype(categoryId:string,topic:string,allowed:Array<{id:string;items:string[]}>){
 const id=legacyCategoryForSite[categoryId];
 const group=allowed.find(g=>g.id===id);
 if(!group||!group.items.length)return '';
 if(group.items.includes(topic))return topic;
 const names:Record<string,string>={
  'افزودن آزمون':'ثبت سفارش','تغییر سفارش':'ثبت سفارش',
  'ارسال فاکتور':'فاکتورهای ارسال‌شده','پیگیری پیش‌فاکتور':'پیش‌نویس فاکتور — ارسال‌نشده',
  'اصلاح پیش‌فاکتور':'پیش‌نویس فاکتور — ارسال‌نشده','دریافت فاکتور':'فاکتورهای ارسال‌شده',
  'فاکتور رسمی':'فاکتورهای ارسال‌شده','مغایرت فاکتور':'درخواست اصلاح فاکتور',
  'ارسال فیش واریز':'اعلام واریز یا فیش — منتظر تأیید بانک',
  'تأیید واریز':'اعلام واریز یا فیش — منتظر تأیید بانک',
  'مانده پرداخت':'صورتحساب و مانده پرداخت','مغایرت پرداخت':'مغایرت پرداخت و پیگیری مانده',
  'تسویه فاکتور':'صورتحساب و مانده پرداخت','استرداد وجه':'لغو سفارش و استرداد وجه',
  'زمان تحویل نتایج':'نتایج ارسال‌شده','نحوه ارسال نتایج':'نتایج ارسال‌شده',
  'بازبینی نتایج':'مشاوره و رفع اشکال نتایج','رفع اشکال نتایج':'مشاوره و رفع اشکال نتایج',
  'مستندات تکمیلی':'درخواست رفع اشکال و اطلاعات تکمیلی',
  'پیشرفت پروژه':'اجرای پروژه و پیگیری آزمایشگاه‌ها','وضعیت آزمایش':'اجرای پروژه و پیگیری آزمایشگاه‌ها',
  'تغییر آزمایش':'اجرای پروژه و پیگیری آزمایشگاه‌ها','هماهنگی آزمایشگاه':'اجرای پروژه و پیگیری آزمایشگاه‌ها',
  'زمان‌بندی اجرا':'اجرای پروژه و پیگیری آزمایشگاه‌ها',
  'استخدام و همکاری':'استخدام و همکاری علمی','ارتباط با مدیریت':'امور داخلی و مدیریت',
  'انتقاد و شکایت':'امور داخلی و مدیریت','امور کارکنان':'امور داخلی و مدیریت',
  'مشکل سامانه':'مشکلات سایت و فرم سفارش','مشکل فرم سفارش':'مشکلات سایت و فرم سفارش',
  'اطلاع‌رسانی':'اطلاع‌رسانی و تبلیغات','تبلیغات':'اطلاع‌رسانی و تبلیغات',
  'مشکل حساب کاربری':'امنیت حساب و دسترسی سامانه','سایر درخواست‌ها':'نیازمند بررسی',
 };
 const candidate=names[topic];
 return candidate&&group.items.includes(candidate)?candidate:group.items[0];
}
export function communicationTranscript(topic:string,request:string,reply:string){
 return 'موضوع درخواست: '+topic+'\n\nشرح تماس / درخواست مشتری:\n'+request.trim()+'\n\nپاسخ پشتیبان / اقدام یا قول داده‌شده:\n'+reply.trim();
}
