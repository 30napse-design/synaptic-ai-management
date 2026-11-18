import {readSheet} from 'read-excel-file/universal';
import {unzipSync} from 'fflate';
import {bankWorkbookCSV} from './bank-workbook';
import {parseBankCSV,parseCSVGrid} from './finance-csv';
import {incomingISO} from './incoming-dates';
import {bankMust} from './bank-policy';
import {bankCanonical} from './bank-matching';
export async function parseBankSource(file:File){
 bankMust(file.size>0&&file.size<=2*1024*1024,'فایل غیرخالی تا ۲ مگابایت انتخاب شود.',413);const ext=file.name.split('.').pop()?.toLowerCase();bankMust(['xlsx','csv'].includes(ext||''),'فقط XLSX یا CSV با قالب شناخته‌شده پشتیبانی می‌شود.');let grid:any[][];
 if(ext==='xlsx'){const bytes=new Uint8Array(await file.arrayBuffer());let size=0,entries=0;try{unzipSync(bytes,{filter:e=>{entries++;size+=e.originalSize;bankMust(e.originalSize<=12*1024*1024&&size<=24*1024*1024&&entries<=250&&!/vbaProject|externalLinks/i.test(e.name),'فایل فشرده بزرگ یا دارای محتوای پشتیبانی‌نشده است.');return false;}});grid=await readSheet(bytes.buffer,1) as any[][];}catch(e:any){throw Error(e.status?e.message:'خواندن XLSX انجام نشد؛ فایل استاندارد و بدون ماکرو لازم است.');}}
 else grid=parseCSVGrid(await file.text());bankMust(grid.length>=2&&grid.length<=5001,'فایل باید عنوان و حداکثر ۵۰۰۰ ردیف داشته باشد.');const header=grid[0],normalized=header.map(v=>bankCanonical(v).replace(/[\s_\u200c]/g,''));bankMust(new Set(normalized.filter(Boolean)).size===normalized.filter(Boolean).length,'ستون تکراری در قالب بانک مجاز نیست.');try{bankWorkbookCSV([header,['2000-01-01','template',1,'template']],incomingISO);}catch(e:any){if(/ستون/.test(e.message))throw e;}
 const result=grid.slice(1).filter(r=>r.some(v=>v!==null&&v!==undefined&&v!=='')).map((raw,index)=>{try{const referenceIndex=normalized.findIndex(v=>['reference','شناسه','شمارهپیگیری','شمارهتراکنشبانک'].includes(v)),reference=raw[referenceIndex];bankMust(typeof reference!=='number'||Number.isSafeInteger(reference)&&Math.abs(reference)<1e15,'شناسه طولانی بانک باید در Excel به صورت متن نگهداری شود.');const row=parseBankCSV(bankWorkbookCSV([header,raw],incomingISO))[0];bankMust(row.reference.length<=180&&row.description.length<=2000&&Math.abs(row.amount_rial)<=9000000000000000,'شناسه تا ۱۸۰، شرح تا ۲۰۰۰ نویسه و مبلغ در محدوده امن دفتر بانک لازم است.');return {index,row,status:'valid',error:''}}catch(e:any){return {index,row:null,status:'invalid',error:e.message}}});
 const groups=new Map<string,any[]>();for(const r of result)if(r.row){const key=bankCanonical(r.row.reference);groups.set(key,[...(groups.get(key)||[]),r]);}for(const group of groups.values()){const variants=new Set(group.map(r=>r.row.date+':'+r.row.amount_rial));if(variants.size>1)for(const r of group){r.status='suspicious';r.error='شناسه یکسان با مبلغ یا تاریخ متعارض در همین فایل.';}else for(const r of group.slice(1)){r.status='duplicate';r.error='تکراری در فایل؛ اصل ردیف حفظ می‌شود.';}}
 return {header:header.map(v=>String(v??'')),rows:result};
}
