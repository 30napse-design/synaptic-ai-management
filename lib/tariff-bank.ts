// Read adapter over the existing tariff snapshot; never approves or changes a rate.
import {legacy} from './legacy';
import {readTariffBanks} from './shared-resources';
import animalReviewed from './animal-services-reviewed.json';
const reviewedAnimalTitles=new Map(animalReviewed.map(row=>[row.code,row.title]));
import pathologyReviewed from './pathology-services-reviewed.json';
import cellularReviewed from './cellular-services-reviewed.json';
import westernReviewed from './western-services-reviewed.json';
import elisaReviewed from './elisa-services-reviewed.json';
const reviewedWesternTitles=new Map(westernReviewed.map(row=>[row.code,row.title]));
const reviewedElisaTitles=new Map(elisaReviewed.map(row=>[row.code,row.title]));
const reviewedPathologyTitles=new Map(pathologyReviewed.map(row=>[row.code,row.title]));
export function tariffCSV(text:string){const rows:string[][]=[];let row:string[]=[],v='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(!quoted&&(c===','||c==='\n'||c==='\r')){row.push(v);v='';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[]}}else v+=c}row.push(v);if(row.some(Boolean))rows.push(row);return rows}
export function approvedTariffServices(script=legacy['tariffs-data.js']){const result:any[]=[];for(const bank of readTariffBanks(script)){const [header,...rows]=tariffCSV(bank.catalog||'');if(!header)continue;const code=header.findIndex(h=>h==='شناسه خدمت'||h==='کد'),description=header.findIndex(h=>['عنوان خدمت','خدمت','نام فارسی'].includes(h)),unit=header.findIndex(h=>h.includes('واحد')),price=header.findIndex(h=>/تعرفه|قیمت/.test(h)),status=header.findIndex(h=>h.includes('وضعیت'));if([code,description,price,status].some(x=>x<0))continue;
 const area=bank.code==='WB'?'وسترن بلات و آزمایش‌های پروتئینی':bank.code==='EL'?'ELISA و سنجش بیومارکرها':bank.code==='GE'?'ژنتیک و بیان ژن':/حیوانی/.test(bank.name)?'مطالعات حیوانی':/پاتولوژی|بافت/.test(bank.name)?'بافت‌شناسی و پاتولوژی':/سلولی/.test(bank.name)?'تکنیک‌های سلولی':/بیوشیمی/.test(bank.name)?'بیوشیمی':'مولکولی و پروتئینی';
 for(const row of rows){const amount=String(row[price]||'').replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c>='۰'?1776:1632))).replace(/[,٬\s]/g,'');if(row[status]?.trim()!=='مصوب'||!/^\d+$/.test(amount)||!Number.isSafeInteger(Number(amount))||Number(amount)<=0||!row[code]||!row[description])continue;result.push({tariff_id:String(bank.code)+':'+row[code],code:row[code],description:(bank.code==='AN'&&reviewedAnimalTitles.get(row[code]))||(bank.code==='HP'&&reviewedPathologyTitles.get(row[code]))||(bank.code==='WB'&&reviewedWesternTitles.get(row[code]))||(bank.code==='EL'&&reviewedElisaTitles.get(row[code]))||row[description],area,unit:row[unit]||'خدمت',unitPriceToman:Number(amount),version:String(bank.updated||'snapshot-e3048ed'),source:bank.name,href:'/manage/tariffs'});}}
 // The attached CRM source explicitly approves 47 WB and 7 EL tariffs.
 // Never promote prior/conditional/under-review rows to an automatic price.
 const observed=new Set(result.map((r:any)=>r.tariff_id));
 for(const [domain,sourceRows,area,file] of [
  ['WB',westernReviewed,'وسترن بلات و آزمایش‌های پروتئینی','SYNAPSE_WB_Approved_1405.xlsx'],
  ['EL',elisaReviewed,'ELISA و سنجش بیومارکرها','SYNAPSE_EL_Approved_1405.xlsx']
 ] as const){
  for(const r of sourceRows){const id=domain+':'+r.code;
   if(observed.has(id)||('reference' in r && !!r.reference)||!r.rateStatus.startsWith('مصوب — تأیید کارفرما')||
    !Number.isSafeInteger(r.sourcePriceToman)||!(Number(r.sourcePriceToman)>0))continue;
   result.push({tariff_id:id,code:r.code,description:r.title,area,unit:r.unit,
    unitPriceToman:Number(r.sourcePriceToman),version:'approved-source-1405-08-07',source:file,href:'/manage/tariffs'});
   observed.add(id);
  }
 }
 const counts=new Map<string,number>();for(const r of result)counts.set(r.tariff_id,(counts.get(r.tariff_id)||0)+1);return result.filter(r=>counts.get(r.tariff_id)===1);
}
export async function selectedTariffLines(lines:any[],scientificOnly:boolean,oldLines:any[]=[],companyId=''){if(!Array.isArray(lines))return lines;const bank=await currentTariffServices(companyId);return lines.map(l=>{const old=oldLines.find(x=>x.id===l.id);const same=old&&['tariff_id','tariff_version','description','area','unit','unit_price'].every(k=>(old[k]??'')===(l[k]??''));if(same)return {...l};
 const candidate=String(l.tariff_id||l.rate_source||'').match(/\b(WB|EL)-\d{3}\b/)?.[0]||'';
 const wb=westernReviewed.find(r=>r.code===candidate||r.title===String(l.description||'').trim());
 const el=elisaReviewed.find(r=>r.code===candidate||r.title===String(l.description||'').trim());
 if(wb&&(wb.reference||wb.rateStatus==='در خدمت پایه'))throw Error('خدمت ارجاعی یا جزئی از بسته وسترن‌بلات نباید دوباره فاکتور شود.');
 if(el?.requiresKitReview&&Number(l.unit_price)>0)throw Error('این سنجش ELISA به تأیید روش کیت و نرخ همان سفارش نیاز دارد.');
 if(!l.tariff_id){const title=String(l.description||'').trim();const source=String(l.rate_source||'');if(title===reviewedPathologyTitles.get('HP-070')||/^HP-070(?:\b|\s|\s*\/)/.test(source))throw Error('HP-070 ارجاع سلولی است و نباید دوباره فاکتور شود.');if((title===reviewedPathologyTitles.get('HP-069')||/^HP-069(?:\b|\s|\s*\/)/.test(source))&&Number(l.unit_price)>0)throw Error('برای HP-069 ابتدا باید تعرفه عددی مصوب ثبت شود.');if(/^(WB|EL)-\d{3}(?:\s|\/|$)/.test(source)&&Number(l.unit_price)>0)throw Error('برای نرخ‌های مشروط یا بدون تصویب خدمات پروتئینی و بیوشیمی، ابتدا تأیید مالی لازم است.');if(/^(CEL|GE)-\d{3}(?:\s|\/|$)/.test(source)&&Number(l.unit_price)>0)throw Error('برای خدمات سلولی یا مولکولی فاقد تعرفه معتبر، ابتدا تصویب قیمت لازم است.');if(scientificOnly)throw Error('خدمت جدید یا قیمت تغییرکرده باید از تعرفه مصوب انتخاب شود؛ قیمت اختصاصی با واحد مالی است.');return {...l};}const rate=bank.find(r=>r.tariff_id===l.tariff_id&&r.version===l.tariff_version);if(!rate||l.unit_price!==rate.unitPriceToman||l.description!==rate.description||l.area!==rate.area||l.unit!==rate.unit)throw Error('تعرفه، نسخه یا قیمت خدمت با بانک مصوب تطابق ندارد؛ خدمت را دوباره انتخاب کنید.');return {...l,rate_source:rate.source+' / '+rate.code+' / '+rate.version};});}

/** All reviewed animal/pathology service references for quote and invoice pickers.
 * Only rates explicitly approved in the current financial tariff snapshot may be autofilled.
 * Other services are reference-only until Finance approves an explicit price.
 */
export function quotationServiceCatalog(rates=approvedTariffServices()){
 const approved=new Map(rates.map((r:any)=>[r.tariff_id,r]));
 const sources=[
  ...animalReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'مطالعات حیوانی',status:r.tariffStatus||'',group:r.group||'',reference:''})),
  ...pathologyReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'بافت‌شناسی و پاتولوژی',status:'قیمت فقط در صورت تطبیق با تعرفه مصوب',group:'',reference:''})),
  ...cellularReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'خدمات سلولی و کشت سلول',status:r.rateStatus,group:r.group,reference:r.reference||''})),
  ...readTariffBanks(legacy['tariffs-data.js']).filter(b=>b.code==='GE').flatMap(b=>{const [h,...rs]=tariffCSV(b.catalog||'');if(!h)return [];const c=h.findIndex(x=>['شناسه خدمت','کد'].includes(x)),t=h.findIndex(x=>['عنوان خدمت','خدمت','نام فارسی'].includes(x)),u=h.findIndex(x=>x.includes('واحد'));return rs.filter(r=>r[c]&&r[t]).map(r=>({code:r[c],title:r[t],unit:r[u]||'خدمت',area:'ژنتیک و بیان ژن',status:'قیمت فقط از تعرفه مصوب',group:'',reference:'',domain:'GE'}));}),
  ...westernReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'وسترن بلات و آزمایش‌های پروتئینی',status:r.rateStatus,group:r.group,reference:r.reference||''})),
  ...elisaReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'ELISA و سنجش بیومارکرها',status:r.rateStatus,group:r.group,reference:'',requiresKitReview:r.requiresKitReview}))
 ];
 const reviewed=sources.map((r:any)=>{
  const id=r.code+''; const domain=r.domain==='GE'?'GE':id.startsWith('AN-')?'AN':id.startsWith('HP-')?'HP':id.startsWith('CEL-')?'CEL':id.startsWith('GE-')?'GE':id.startsWith('WB-')?'WB':'EL';
  const tariff_id=domain+':'+id;
  const rate:any=approved.get(tariff_id);
  const financeApproved=String(rate?.version||'').startsWith('fin08:');
  // HP-069 has no sourced numerical rate; HP-070 is a cross-lab referral.
  const referral=id==='HP-070'||(domain==='CEL'&&!!r.reference)||(domain==='GE'&&!!r.reference)||id==='GE-070'||(domain==='WB'&&!!r.reference)||r.status==='در خدمت پایه',priceInquiry=(id==='HP-069'&&!String(rate?.version||'').startsWith('fin08:'))||(!financeApproved&&(r.status==='استعلام'||r.status==='جدید پیشنهادی'||r.status==='پیشنهادی'))||('requiresKitReview' in r && r.requiresKitReview===true)||(!financeApproved&&(r.status==='مصوب قبلی'||r.status==='معادل نرخ پایه'||r.status==='اصلاح‌شده توسط کارفرما'));
  return {code:id,tariff_id,description:r.title,area:r.area,unit:rate?.unit||r.unit||'خدمت',group:r.group,
    approved:!!rate&&!referral&&!priceInquiry&&(domain!=='CEL'||financeApproved)&&(domain!=='GE'||r.domain==='GE'||r.status==='مصوب'||financeApproved)&&(domain!=='WB'||r.status.startsWith('مصوب — تأیید')||financeApproved)&&(domain!=='EL'||!r.requiresKitReview),referral,priceInquiry,
    unitPriceToman:rate&&!referral&&!priceInquiry&&(domain!=='CEL'||financeApproved)&&(domain!=='GE'||r.domain==='GE'||r.status==='مصوب'||financeApproved)&&(domain!=='WB'||r.status.startsWith('مصوب — تأیید')||financeApproved)&&(domain!=='EL'||!r.requiresKitReview)?rate.unitPriceToman:null,
    version:rate?.version||'',source:rate?.source||'کاتالوگ استاندارد آزمایشگاه',
    status:referral?'ارجاع/شامل خدمت پایه؛ بدون ردیف تکراری':priceInquiry?'استعلام یا تأیید قیمت ضروری':rate&&(domain!=='CEL'||financeApproved)&&(domain!=='GE'||r.domain==='GE'||r.status==='مصوب'||financeApproved)&&(domain!=='WB'||r.status.startsWith('مصوب — تأیید')||financeApproved)&&(domain!=='EL'||!r.requiresKitReview)?'تعرفه مصوب':r.status||'نیازمند بازبینی قیمت'};
 });
 const seen=new Set(reviewed.map(r=>r.tariff_id));
 const otherApproved=rates.filter((r:any)=>!seen.has(r.tariff_id)).map((r:any)=>({code:r.code,tariff_id:r.tariff_id,description:r.description,area:r.area,unit:r.unit||'خدمت',group:r.area,approved:true,referral:false,priceInquiry:false,unitPriceToman:r.unitPriceToman,version:r.version,source:r.source,status:'تعرفه مصوب'}));
 return [...reviewed,...otherApproved];
}

// Approved dated extensions of the existing bank; draft proposals never override reference prices.
export async function currentTariffServices(companyId=''){const base=approvedTariffServices();if(!companyId)return base;const {db}=await import('./staff-server');const {financialToday}=await import('./financial-calendar');const r=await db().prepare("SELECT value FROM finance_settings WHERE id='accounting-tariffs'").first<any>(),v=r?JSON.parse(r.value).versions||[]:[],today=financialToday(),latest=new Map<string,any>();for(const t of v.filter((t:any)=>t.company_id===companyId&&t.state==='approved'&&t.valid_from<=today&&(!t.valid_to||t.valid_to>=today)).sort((a:any,b:any)=>a.version-b.version))latest.set(t.code,t);return [...base.filter(s=>!latest.has(s.tariff_id)),...[...latest.values()].map(t=>({tariff_id:t.code,code:t.code,description:t.title,area:t.group,unit:t.unit,unitPriceToman:t.rate_rial/10,version:'fin08:'+t.id+':'+t.version,source:t.reference,href:'/finance/ledger?tab=tariffs'}))];}
