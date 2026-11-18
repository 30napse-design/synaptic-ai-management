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
export const ticketTargets:Record<string,string>={'پشتیبانی':'it_security_manager','مسئول فنی':'research_manager','مدیریت':'executive_director','هماهنگی مجریان و پیمانکاران':'research_specialist','پذیرش پژوهشکده':'customer_manager'};
export function jobDomain(j:any){const n=typeof j.notes==='string'?JSON.parse(j.notes||'{}'):j.notes||{};return laboratoryDomains.find(d=>d.id===n.center_domain)||laboratoryDomains.find(d=>d.departments.includes(n.department))||laboratoryDomains.find(d=>d.areas.includes(j.area));}
export const datasetStates:Record<string,string>={draft:'پیش‌نویس',completing:'در حال تکمیل',ready:'آماده تحویل به هماهنگ‌کننده علمی',needs_completion:'نیازمند تکمیل'};
export function cleanDataset(b:any){const d:any={};for(const k of ['title','execution_date','method','equipment','conditions','method_changes','limitations','analysis','findings','exceptions','report_title','report_method','report_findings','report_notes','report_limitations','technical_signatory','repository_url'])d[k]=String(b[k]||'').trim().slice(0,16000);d.sample_count=Number(b.sample_count||0);d.sample_ids=Array.isArray(b.sample_ids)?[...new Set(b.sample_ids.map(String))].slice(0,1000):[];d.assets=Array.isArray(b.assets)?b.assets.map((a:any)=>({id:String(a.id),section:String(a.section),description:String(a.description||'').slice(0,4000)})).slice(0,1000):[];return d;}
