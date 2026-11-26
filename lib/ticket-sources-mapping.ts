// Stable existing filter IDs; SRC codes are aliases, not a new database schema.
export const ticketSourceOptions=[
 {id:'',label:'همه منابع',code:''},
 {id:'site',label:'تیکت پشتیبانی سایت',code:'SRC-01'},
 {id:'research_order',label:'سفارش خدمات پژوهشی',code:'SRC-02'},
 {id:'quick_request',label:'درخواست سریع',code:'SRC-03'},
 {id:'collaboration',label:'درخواست همکاری',code:'SRC-04'},
 {id:'contact',label:'تماس با ما',code:'SRC-05'},
 {id:'direct',label:'ثبت داخلی سامانه',code:'SRC-06'},
 {id:'gmail',label:'Gmail',code:'SRC-07'},
] as const;
export const websiteFormIds=['research_order','quick_request','collaboration','contact'] as const;
export type WebsiteFormId=typeof websiteFormIds[number];
export function isWebsiteFormId(value:unknown):value is WebsiteFormId{return websiteFormIds.some(id=>id===value)}
// Only an authenticated integration's configured ID, never a free-text form field.
export function configuredWebsiteForm(source:{id:string;channel:string}):WebsiteFormId|undefined{
 if(source.channel!=='website')return;
 return websiteFormIds.find(id=>source.id==='website-'+id.replaceAll('_','-'));
}
export function ticketSourceLabel(row:{sourceLabels?:any;channel?:string;sourceType?:string}):string|undefined{
 const id=row.sourceLabels?.ticket_source;
 const form=row.sourceLabels?.website_form;
 const key=row.channel==='website'&&isWebsiteFormId(form)?form:id==='site'||id==='direct'?id:row.channel==='gmail'||row.sourceType==='gmail'?'gmail':undefined;
 return ticketSourceOptions.find(x=>x.id===key)?.label;
}
