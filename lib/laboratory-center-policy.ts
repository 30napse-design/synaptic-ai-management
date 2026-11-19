export const laboratoryDomains=[
{id:'animal',title:'آزمایشگاه مطالعات حیوانی',departments:['حیوانی'],areas:['مطالعات حیوانی']},
{id:'histology',title:'آزمایشگاه بافت‌شناسی',departments:['پاتولوژی'],areas:['بافت‌شناسی و پاتولوژی']},
{id:'cell-molecular',title:'آزمایشگاه سلولی و مولکولی',departments:['سلولی','مولکولی'],areas:['تکنیک‌های سلولی','مولکولی','مولکولی و پروتئینی']},
{id:'protein-biochemistry',title:'آزمایشگاه پروتئینی و بیوشیمی',departments:['پروتئینی','بیوشیمی'],areas:['پروتئینی','بیوشیمی','مولکولی و پروتئینی']},
{id:'microbiology',title:'آزمایشگاه میکروبیولوژی',departments:['میکروبیولوژی'],areas:['میکروب‌شناسی']},
{id:'other',title:'سایر خدمات آزمایشگاهی',departments:['سایر خدمات آزمایشگاهی'],areas:['سایر خدمات تخصصی']}
];
export const laboratoryTabs=['داشبورد','بانک خدمات','سفارش‌های کار','استعلام خدمات','مدیریت نمونه‌ها','داده‌ها و نتایج','تیکت‌ها و مکاتبات'];
export const caseStates=['منتظر ارجاع','منتظر نمونه','منتظر دارو یا مواد','منتظر تأمین حیوان','در حال آماده‌سازی','در حال اجرا','تکمیل‌شده'];
export const inquirySubjects=['امکان انجام خدمت','روش و الزامات علمی','شرایط نمونه و مواد','زمان تقریبی اجرا','سایر موارد'];
export const ticketTargets:Record<string,string>={'رئیس پژوهشکده':'management','مالی و قراردادها':'finance_manager','طراحی علمی':'scientific_manager','امور اداری':'administration_manager','پشتیبانی':'it_security_manager','مسئول فنی':'research_manager','مدیریت':'executive_director','هماهنگی مجریان و پیمانکاران':'research_specialist','پذیرش پژوهشکده':'customer_manager'};
// Historical jobs use plain-text notes. Only explicit object metadata can supply links.
// This adapter never rewrites notes, guesses a mother project, or grants access.
export function jobMetadata(j:any){
 let raw:any=j?.notes;
 if(typeof raw==='string'){try{raw=JSON.parse(raw)}catch{return {}}}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 return {...raw,
  mother_project:typeof raw.mother_project==='string'?raw.mother_project:'',
  department:typeof raw.department==='string'?raw.department:'',
  center_domain:typeof raw.center_domain==='string'?raw.center_domain:'',
  services:Array.isArray(raw.services)?raw.services.filter((s:any)=>s&&typeof s==='object'&&!Array.isArray(s)&&typeof s.description==='string'&&Number.isSafeInteger(s.quantity)&&s.quantity>0&&typeof s.unit==='string'):[]
 };
}
export function jobDomain(j:any){const n=jobMetadata(j);return laboratoryDomains.find(d=>d.id===n.center_domain)||laboratoryDomains.find(d=>d.departments.includes(n.department))||laboratoryDomains.find(d=>d.areas.includes(j.area));}
export const datasetStates:Record<string,string>={draft:'پیش‌نویس',completing:'در حال تکمیل',ready:'آماده تحویل به هماهنگ‌کننده علمی',needs_completion:'نیازمند تکمیل'};
export function cleanDataset(b:any){const d:any={};for(const k of ['title','execution_date','method','equipment','conditions','method_changes','limitations','analysis','findings','exceptions','report_title','report_method','report_findings','report_notes','report_limitations','technical_signatory','repository_url'])d[k]=String(b[k]||'').trim().slice(0,16000);d.sample_count=Number(b.sample_count||0);d.sample_ids=Array.isArray(b.sample_ids)?[...new Set(b.sample_ids.map(String))].slice(0,1000):[];d.assets=Array.isArray(b.assets)?b.assets.map((a:any)=>({id:String(a.id),section:String(a.section),description:String(a.description||'').slice(0,4000)})).slice(0,1000):[];return d;}
