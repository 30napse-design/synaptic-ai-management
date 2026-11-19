// Read adapter over the existing tariff snapshot; never approves or changes a rate.
import {legacy} from './legacy';
import {readTariffBanks} from './shared-resources';
import animalReviewed from './animal-services-reviewed.json';
const reviewedAnimalTitles=new Map(animalReviewed.map(row=>[row.code,row.title]));
import pathologyReviewed from './pathology-services-reviewed.json';
const reviewedPathologyTitles=new Map(pathologyReviewed.map(row=>[row.code,row.title]));
export function tariffCSV(text:string){const rows:string[][]=[];let row:string[]=[],v='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(!quoted&&(c===','||c==='\n'||c==='\r')){row.push(v);v='';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[]}}else v+=c}row.push(v);if(row.some(Boolean))rows.push(row);return rows}
export function approvedTariffServices(script=legacy['tariffs-data.js']){const result:any[]=[];for(const bank of readTariffBanks(script)){const [header,...rows]=tariffCSV(bank.catalog||'');if(!header)continue;const code=header.findIndex(h=>h==='شناسه خدمت'||h==='کد'),description=header.findIndex(h=>['عنوان خدمت','خدمت','نام فارسی'].includes(h)),unit=header.findIndex(h=>h.includes('واحد')),price=header.findIndex(h=>/تعرفه|قیمت/.test(h)),status=header.findIndex(h=>h.includes('وضعیت'));if([code,description,price,status].some(x=>x<0))continue;
 const area=/حیوانی/.test(bank.name)?'مطالعات حیوانی':/پاتولوژی|بافت/.test(bank.name)?'بافت‌شناسی و پاتولوژی':/سلولی/.test(bank.name)?'تکنیک‌های سلولی':/بیوشیمی/.test(bank.name)?'بیوشیمی':'مولکولی و پروتئینی';
 for(const row of rows){const amount=String(row[price]||'').replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c>='۰'?1776:1632))).replace(/[,٬\s]/g,'');if(row[status]?.trim()!=='مصوب'||!/^\d+$/.test(amount)||!Number.isSafeInteger(Number(amount))||Number(amount)<=0||!row[code]||!row[description])continue;result.push({tariff_id:String(bank.code)+':'+row[code],code:row[code],description:(bank.code==='AN'&&reviewedAnimalTitles.get(row[code]))||(bank.code==='HP'&&reviewedPathologyTitles.get(row[code]))||row[description],area,unit:row[unit]||'خدمت',unitPriceToman:Number(amount),version:String(bank.updated||'snapshot-e3048ed'),source:bank.name,href:'/manage/tariffs'});}}
 const counts=new Map<string,number>();for(const r of result)counts.set(r.tariff_id,(counts.get(r.tariff_id)||0)+1);return result.filter(r=>counts.get(r.tariff_id)===1);
}
export function selectedTariffLines(lines:any[],scientificOnly:boolean,oldLines:any[]=[]){if(!Array.isArray(lines))return lines;const bank=approvedTariffServices();return lines.map(l=>{const old=oldLines.find(x=>x.id===l.id);const same=old&&['tariff_id','tariff_version','description','area','unit','unit_price'].every(k=>(old[k]??'')===(l[k]??''));if(same)return {...l};if(!l.tariff_id){if(scientificOnly)throw Error('خدمت جدید یا قیمت تغییرکرده باید از تعرفه مصوب انتخاب شود؛ قیمت اختصاصی با واحد مالی است.');return {...l};}const rate=bank.find(r=>r.tariff_id===l.tariff_id&&r.version===l.tariff_version);if(!rate||l.unit_price!==rate.unitPriceToman||l.description!==rate.description||l.area!==rate.area||l.unit!==rate.unit)throw Error('تعرفه، نسخه یا قیمت خدمت با بانک مصوب تطابق ندارد؛ خدمت را دوباره انتخاب کنید.');return {...l,rate_source:rate.source+' / '+rate.code+' / '+rate.version};});}

/** All reviewed animal/pathology service references for quote and invoice pickers.
 * Only rates explicitly approved in the current financial tariff snapshot may be autofilled.
 * Other services are reference-only until Finance approves an explicit price.
 */
export function quotationServiceCatalog(){
 const approved=new Map(approvedTariffServices().map((r:any)=>[r.tariff_id,r]));
 const sources=[
  ...animalReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'مطالعات حیوانی',status:r.tariffStatus||'',group:r.group||''})),
  ...pathologyReviewed.map((r:any)=>({code:r.code,title:r.title,unit:r.unit,area:'بافت‌شناسی و پاتولوژی',status:'قیمت فقط در صورت تطبیق با تعرفه مصوب',group:''}))
 ];
 const reviewed=sources.map(r=>{
  const id=r.code+''; const domain=id.startsWith('AN-')?'AN':'HP';
  const tariff_id=domain+':'+id;
  const rate:any=approved.get(tariff_id);
  // HP-069 has no sourced numerical rate; HP-070 is a cross-lab referral.
  const referral=id==='HP-070',priceInquiry=id==='HP-069';
  return {code:id,tariff_id,description:r.title,area:r.area,unit:rate?.unit||r.unit||'خدمت',group:r.group,
    approved:!!rate&&!referral&&!priceInquiry,referral,priceInquiry,
    unitPriceToman:rate&&!referral&&!priceInquiry?rate.unitPriceToman:null,
    version:rate?.version||'',source:rate?.source||'کاتالوگ استاندارد آزمایشگاه',
    status:referral?'ارجاع به آزمایشگاه سلولی؛ بدون ردیف تکراری':priceInquiry?'استعلام قیمت ضروری':rate?'تعرفه مصوب':'نیازمند قیمت‌گذاری و تأیید'};
 });
 const seen=new Set(reviewed.map(r=>r.tariff_id));
 const otherApproved=approvedTariffServices().filter((r:any)=>!seen.has(r.tariff_id)).map((r:any)=>({code:r.code,tariff_id:r.tariff_id,description:r.description,area:r.area,unit:r.unit||'خدمت',group:r.area,approved:true,referral:false,priceInquiry:false,unitPriceToman:r.unitPriceToman,version:r.version,source:r.source,status:'تعرفه مصوب'}));
 return [...reviewed,...otherApproved];
}
