/** The nine approved intake RESPONSIBILITY GROUPS, separate from the nine staff accounts.
 * Read-only classification for historic Gmail/phone records. Never rewrite subtype,
 * owner, priority, statuses or access control from a display classification.
 * A group is returned only when the existing authoritative category/subtype
 * unambiguously supports it. Ambiguous sensitive/manager matters require review.
 */
export const intakeNineGroups=[
 {id:'reception',label:'پذیرش، سفارش و تحویل نمونه',legacy:['customers','visits']},
 {id:'financial',label:'فاکتور، پرداخت، مانده و استرداد',legacy:['billing']},
 {id:'results',label:'نتایج، رفع اشکال و تصمیم علمی',legacy:['results']},
 {id:'projects',label:'پیشرفت پروژه و هماهنگی آزمایشگاه',legacy:['projects']},
 {id:'scientific',label:'بررسی تخصصی و اجرای آزمایش',legacy:[]},
 {id:'administration',label:'استخدام، اسناد و امور داخلی',legacy:['internal']},
 {id:'systems',label:'مشکلات سامانه، اتصال و دسترسی',legacy:['system']},
 {id:'escalations',label:'اختلاف حساس، تأخیر جدی و موارد مبهم',legacy:[]},
 {id:'executive',label:'تصمیم نهایی مدیریت در موارد استثنایی',legacy:[]},
] as const;
export type IntakeGroupId=(typeof intakeNineGroups)[number]['id'];
export type IntakeNineClassification={id:IntakeGroupId|null;needsReview:boolean;reason:string};
const scienceTokens=['بررسی تخصصی','اجرای آزمایش','تصمیم علمی','بررسی علمی'];
const escalationTokens=['شکایت','اختلاف','مغایرت جدی','تاخیر جدی','تأخیر جدی','نیازمند بررسی'];
const executiveTokens=['تصمیم نهایی مدیریت','ارجاع استثنایی مدیر'];
export function classifyIncomingNine(record:{category?:string;subtype?:string;source_type?:string;sourceType?:string;manager_only?:boolean;managerOnly?:boolean}):IntakeNineClassification{
 const category=String(record.category||''),subtype=String(record.subtype||'').trim();
 if(!subtype)return {id:null,needsReview:true,reason:'موضوع مشخص نشده است'};
 if(executiveTokens.includes(subtype))return {id:'executive',needsReview:false,reason:'ارجاع مدیریتی صریح'};
 if(escalationTokens.includes(subtype))return {id:'escalations',needsReview:true,reason:'مورد حساس؛ تأیید انسانی لازم است'};
 if(scienceTokens.includes(subtype))return {id:'scientific',needsReview:false,reason:'موضوع تخصصی صریح'};
 if(record.manager_only||record.managerOnly)return {id:null,needsReview:true,reason:'پرونده محدود به مدیریت؛ تعیین گروه با مدیر'};
 const group=intakeNineGroups.find(g=>(g.legacy as readonly string[]).includes(category));
 if(group)return {id:group.id,needsReview:false,reason:'دسته اصلی ثبت‌شده'};
 return {id:null,needsReview:true,reason:'برچسب تاریخی نامشخص؛ نیازمند بازبینی'};
}
export function nineGroupName(id:string|null){return intakeNineGroups.find(g=>g.id===id)?.label||'نیازمند طبقه‌بندی';}
