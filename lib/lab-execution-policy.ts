import {hasAccess,hasDataAccess} from './auth-policy.ts';
export const executionStatuses:Record<string,string>={received:'ابلاغ سفارش',doing:'در حال اجرا',paused:'نیازمند هماهنگی / متوقف',ready:'گزارش تحویل پژوهشکده شد',delivered:'دریافت توسط عملیات'};
export const sampleStatuses:Record<string,string>={prepared:'آماده ارسال',sent:'ارسال‌شده',received:'دریافت‌شده',issue:'مغایرت نمونه',consumed:'مصرف‌شده',returned:'برگشت‌داده‌شده',retained:'نگهداری با مهلت مصوب',disposed:'امحای مستند'};
export const inquiryStatuses:Record<string,string>={open:'منتظر پیشنهاد',quoted:'پیشنهاد دریافت شد',declined:'عدم پذیرش',selected:'انتخاب‌شده',closed:'بسته‌شده'};
export const statementStatuses:Record<string,string>={submitted:'ارسال‌شده',reviewed:'بررسی عملیات',approved:'تأیید مدیریت',settled:'تسویه ثبت‌شده مدیریت'};
export const canCoordinate=(u:any)=>!!u&&!u.laboratory&&(u.manager||hasAccess(u,'lab_operations'));
export const canEnterLabs=(u:any)=>!!u&&(u.laboratory||hasAccess(u,'lab')||hasDataAccess(u,'sample_intake')||hasDataAccess(u,'research_supervision')||hasDataAccess(u,'results_ops')||canCoordinate(u));
export function canReadLabJob(u:any,j:any){return !!u&&(u.laboratory?!!j.laboratory_id&&j.laboratory_id===u.laboratoryId:canCoordinate(u)||hasDataAccess(u,'sample_intake')||hasDataAccess(u,'research_supervision')||j.assignee===u.email||j.created_by===u.email||j.scientific_contact===u.email)}
export const canExecuteLabJob=(u:any,j:any)=>canReadLabJob(u,j)&&(u.manager||u.laboratory||canCoordinate(u)||hasDataAccess(u,'lab')&&j.assignee===u.email);
export function jobScope(u:any,a='j'){return u.laboratory?{sql:`${a}.laboratory_id=?`,args:[u.laboratoryId]}:canCoordinate(u)||hasDataAccess(u,'sample_intake')||hasDataAccess(u,'research_supervision')?{sql:'1=1',args:[]}:{sql:`(${a}.assignee=? OR ${a}.created_by=? OR ${a}.scientific_contact=?)`,args:[u.email,u.email,u.email]}}
export const workCode=(j:any)=>j.work_code||'WO-'+j.id.slice(0,8).toUpperCase();
export function executionJob(j:any,u:any){if(hasDataAccess(u,'sample_intake')&&!canReadLabEvidence(u,j))return {id:j.id,work_code:workCode(j),laboratory_id:j.laboratory_id,laboratory_name:j.laboratory_name,laboratory_type:j.laboratory_type,client:j.client,reference:j.reference,area:j.area,service:j.service,quantity:j.quantity,due:j.due,status:j.status,revision:j.revision,work_version:j.work_version,acceptance:j.acceptance};if(u.laboratory||!canCoordinate(u))return {...(!u.laboratory?{assignee:j.assignee,scientific_contact:j.scientific_contact,created_by:j.created_by}:{}),id:j.id,laboratory_id:j.laboratory_id,laboratory_name:j.laboratory_name,work_code:workCode(j),area:j.area,service:j.service,quantity:j.quantity,due:j.due,status:j.status,instructions:j.instructions,progress:j.progress,progress_notes:j.progress_notes,work_version:j.work_version,acceptance:j.acceptance,accepted_version:j.accepted_version,accepted_at:j.accepted_at,revision:j.revision,updated_at:j.updated_at};if(u.manager){const {paid,vendor_paid,...safe}=j;return {...safe,work_code:workCode(j)}}const {price,paid,cost,vendor_paid,...safe}=j;return {...safe,work_code:workCode(j)}}
export function laboratoryProfile(l:any,u:any){const {private_notes,...safe}=l;return {...(canCoordinate(u)?l:safe),areas:JSON.parse(l.areas)}}
export const text=(v:any,max:number,required=false)=>typeof v==='string'&&v.length<=max&&(!required||v.trim().length>0);
export const whole=(v:any,min=0,max=1000000000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
export const https=(v:any)=>typeof v==='string'&&(!v||/^https:\/\//.test(v));
export const isoDay=(v:any)=>typeof v==='string'&&(!v||/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v);
export const scopeSnapshot=(j:any)=>({laboratory_id:j.laboratory_id,work_code:workCode(j),area:j.area,service:j.service,quantity:j.quantity,instructions:j.instructions,due:j.due,work_version:j.work_version});

export const sampleIntakeOnly=(u:any)=>!!u&&!u.manager&&!u.laboratory&&hasDataAccess(u,'sample_intake')&&!hasDataAccess(u,'lab')&&!hasDataAccess(u,'lab_operations')&&!hasDataAccess(u,'results_ops')&&!hasDataAccess(u,'research_supervision');

export function canReadLabEvidence(u:any,j:any){return !!u&&(u.manager||u.laboratory&&j.laboratory_id===u.laboratoryId||canCoordinate(u)||hasDataAccess(u,'research_supervision')||(hasDataAccess(u,'lab')||hasDataAccess(u,'results_ops'))&&(j.assignee===u.email||j.created_by===u.email||j.scientific_contact===u.email))}

export const canIntakeSamples=(u:any)=>hasDataAccess(u,'sample_intake');
