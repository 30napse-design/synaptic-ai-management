/** Conservative source-to-science routing. No historic category rewrites or inferred ownership.
 * Financial, HR, and unrelated calls are never auto-imported into the science desk.
 * A separate canSeeOps check remains mandatory before displaying or linking.
 */
export function isScienceConsultationSource(record:any):boolean{
 const category=String(record?.category||'');
 if(category==='results')return true;
 if(category!=='customers'&&category!=='projects')return false;
 let route:any=null;try{route=typeof record.routing==='string'?JSON.parse(record.routing):record.routing}catch{}
 const family=String(route?.family||route?.dispatchFamily||'');
 if(['A02','A07','A10','A11','A13'].includes(family))return true;
 if(family&&family!=='A18')return false;
 const topic=String(record.subtype||'')+' '+String(record.title||'');
 if(category==='customers')return /مشاوره|پروپوزال|طراحی مطالعه|انتخاب روش|پروتکل|امکان.?سنجی|بررسی علمی|اصلاح طرح/.test(topic);
 return /مشاوره|پروتکل|آزمایشگاه|اجرای آزمایش|کنترل علمی|رفع اشکال علمی|روش آزمایش|تغییر آزمون/.test(topic);
}
