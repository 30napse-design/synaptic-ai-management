/**
 * Approved user-facing ticket topic catalog.
 * This is presentation metadata: legacy ops_items subtype/category keys are NOT
 * rewritten or migrated by this module. Never auto-map unmatched new labels.
 */
export const siteTicketCategories=[
 {id:'orders',title:'درخواست‌ها و سفارش‌ها',topics:['ثبت سفارش','افزودن آزمون','تغییر سفارش','تحویل نمونه']},
 {id:'invoices',title:'پیگیری ارسال فاکتور',topics:['ارسال فاکتور','پیگیری پیش‌فاکتور','اصلاح پیش‌فاکتور','دریافت فاکتور','فاکتور رسمی','مغایرت فاکتور']},
 {id:'payments',title:'پرداخت‌ها و تسویه',topics:['ارسال فیش واریز','تأیید واریز','مانده پرداخت','مغایرت پرداخت','تسویه فاکتور','استرداد وجه']},
 {id:'results',title:'نتایج و خدمات علمی',topics:['زمان تحویل نتایج','نحوه ارسال نتایج','بازبینی نتایج','رفع اشکال نتایج','مستندات تکمیلی']},
 {id:'projects',title:'پروژه‌ها و آزمایشگاه‌ها',topics:['پیشرفت پروژه','وضعیت آزمایش','تغییر آزمایش','هماهنگی آزمایشگاه','زمان‌بندی اجرا']},
 {id:'internal',title:'امور داخلی و اداری',topics:['استخدام و همکاری','ارتباط با مدیریت','انتقاد و شکایت','امور کارکنان']},
 {id:'system',title:'سامانه و سایر موارد',topics:['مشکل سامانه','مشکل فرم سفارش','اطلاع‌رسانی','تبلیغات','مشکل حساب کاربری','سایر درخواست‌ها']},
] as const;
export const directTicketCategories=[
 {id:'collaboration',title:'همکاری و استخدام',topics:['ارسال رزومه','درخواست همکاری پژوهشی','همکاری تخصصی و آزمایشگاهی']},
 {id:'proposal',title:'طرح‌ها و پروژه‌های پژوهشی',topics:['ارسال پروپوزال','پیشنهاد طرح مشترک','درخواست اجرای پروژه']},
 {id:'organization',title:'همکاری‌های سازمانی',topics:['همکاری با دانشگاه یا پژوهشگاه','همکاری با شرکت یا صنعت','تفاهم‌نامه و قرارداد همکاری']},
 {id:'general',title:'ارتباطات عمومی',topics:['پیام فرم تماس با ما','پرسش عمومی','انتقاد و پیشنهاد','سایر موارد']},
] as const;
export type TicketEntrySource='site'|'direct';
export function getTicketCategories(source:TicketEntrySource){return source==='site'?siteTicketCategories:directTicketCategories;}
export function hasTicketTopic(source:TicketEntrySource,categoryId:string,topic:string){
 const category=getTicketCategories(source).find(x=>x.id===categoryId);
 return !!category&&category.topics.some(x=>x===topic);
}
