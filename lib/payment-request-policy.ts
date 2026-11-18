import {canFinance,canApproveFinance,integer,day,str,link,currencyRial} from './finance-policy';
import {OWNER} from './staff-policy';
export {canFinance,canApproveFinance};
export const requestTypes:Record<string,{label:string;nature:string;personal:boolean}>= {
 advance:{label:'مساعده',nature:'employee_receivable',personal:true},loan:{label:'وام کارکنان',nature:'employee_receivable',personal:true},
 reimbursement:{label:'بازپرداخت هزینه شخصی',nature:'expense',personal:true},salary:{label:'حقوق و مزایا',nature:'expense',personal:true},mission:{label:'هزینه مأموریت',nature:'expense',personal:true},
 administration:{label:'هزینه اداری و جاری',nature:'expense',personal:false},legal:{label:'بیمه، مالیات و تعهد قانونی',nature:'expense',personal:false},
 research:{label:'هزینه پژوهشی و آزمایشگاهی',nature:'expense',personal:false},equipment:{label:'خرید تجهیزات و دارایی',nature:'asset',personal:false},
 maintenance:{label:'تعمیرات و فناوری',nature:'expense',personal:false},petty:{label:'شارژ تنخواه',nature:'petty_fund',personal:false},
 debt:{label:'بازپرداخت تسهیلات مجموعه',nature:'loan_liability',personal:false},deposit:{label:'سپرده و ودیعه',nature:'deposit_asset',personal:false},
 transfer:{label:'انتقال بین حساب‌های مجموعه',nature:'transfer_clearing',personal:false},other:{label:'سایر درخواست‌ها',nature:'expense',personal:false}
};
export const requestStates:Record<string,string>={draft:'پیش‌نویس',submitted:'ثبت‌شده',review:'در بررسی مالی',correction:'نیازمند اصلاح',approval:'منتظر تأیید',approved:'تأییدشده',ready:'آماده پرداخت',reported:'پرداخت ثبت‌شده / منتظر تطبیق',partial:'پرداخت جزئی',settled:'تسویه‌شده',mismatch:'دارای مغایرت',suspended:'تعلیق‌شده',rejected:'ردشده',cancelled:'لغوشده'};
export class PaymentRequestError extends Error{constructor(message:string,public status=400){super(message)}}
export function requirePayment(v:any,message:string,status=400):asserts v{if(!v)throw new PaymentRequestError(message,status)}
export const parseRequest=(p:any)=>{try{return p?.request_meta?JSON.parse(p.request_meta):null}catch{return null}};
export const isOwner=(u:any)=>!!u&&u.email===OWNER&&!!u.manager&&!u.laboratory;
export const canRequest=(u:any)=>!!u&&!u.laboratory;
export function requestGrant(u:any,m:any,scope:string){return (m?.grants||[]).some((g:any)=>g.member===u?.email&&g.scopes.includes(scope)&&g.expires_at>new Date().toISOString());}
export const canReadRequest=(u:any,p:any)=>canRequest(u)&&!!parseRequest(p)&&(isOwner(u)||canFinance(u)||p.created_by===u.email||requestGrant(u,parseRequest(p),'read')||requestGrant(u,parseRequest(p),'fulfill'));
export const privilegedRequest=(u:any)=>isOwner(u)||canFinance(u);
export function mayApproveRequest(u:any,p:any){const m=parseRequest(p);return canRequest(u)&&u.email!==p.created_by&&(isOwner(u)||(m?.grants||[]).some((g:any)=>g.member===u.email&&g.scopes.includes('approve')&&g.expires_at>new Date().toISOString()&&g.max_rial>=m.proposed_rial));}
export const requestAccount=(nature:string)=>({expense:'expense',employee_receivable:'employee_receivable',asset:'asset',petty_fund:'petty_fund',loan_liability:'loan_liability',deposit_asset:'deposit_asset',transfer_clearing:'transfer_clearing'} as Record<string,string>)[nature];
export function validateRequest(b:any,previous?:any){
 requirePayment(Object.hasOwn(requestTypes,b.type),'نوع درخواست معتبر انتخاب شود.');const type=requestTypes[b.type],amount=currencyRial(b.amount,b.currency||'IRT');
 requirePayment(str(b.title,240,true)&&str(b.description||'',6000)&&str(b.beneficiary,240,true)&&day(b.due||'')&&str(b.unit||'',160)&&str(b.project_id||'',160)&&str(b.contract_id||'',160)&&link(b.evidence_url||''),'عنوان، ذی‌نفع، موعد، مبلغ و مدارک معتبر لازم است.');
 requirePayment(b.type!=='research'||b.project_id,'هزینه پژوهشی به پرونده مادر موجود متصل شود.');
 const repayments=Array.isArray(b.repayments)?b.repayments:[];requirePayment(repayments.length<=120&&repayments.every((r:any)=>integer(r.amount_rial,1)&&day(r.due)&&!!r.due),'برنامه بازپرداخت معتبر نیست.');
 if(['advance','loan'].includes(b.type))requirePayment(repayments.length&&repayments.reduce((s:number,r:any)=>s+r.amount_rial,0)===amount,'جمع برنامه پیشنهادی بازپرداخت باید برابر مبلغ درخواست باشد.');
 const schedule=Array.isArray(b.schedule)?b.schedule:[];requirePayment(schedule.length<=120&&schedule.every((r:any)=>integer(r.amount_rial,1)&&day(r.due)&&!!r.due)&&(!schedule.length||schedule.reduce((s:number,r:any)=>s+r.amount_rial,0)===amount),'تعهد دوره‌ای باید برنامه معتبر با جمع برابر مبلغ داشته باشد.');
 requirePayment(!schedule.length||b.contract_id||b.evidence_url,'تعهد دوره‌ای به قرارداد یا مستند معتبر متصل شود.');
 const destination=String(b.destination_account||'').trim();requirePayment(str(destination,180)&&str(b.custodian||'',180),'حساب مقصد یا تنخواه‌دار معتبر نیست.');
 requirePayment(b.type!=='transfer'||destination,'حساب مقصد انتقال لازم است.');requirePayment(b.type!=='petty'||b.custodian,'تنخواه‌دار مشخص شود.');
 return {...previous,type:b.type,title:b.title.trim(),description:b.description||'',beneficiary:b.beneficiary.trim(),requested_rial:amount,proposed_rial:amount,nature:type.nature,personal:type.personal,unit:b.unit||'',project_id:b.project_id||'',contract_id:b.contract_id||'',due:b.due||'',evidence_url:b.evidence_url||'',repayments,schedule,destination_account:destination,custodian:b.custodian||''};
}
export function paymentTotals(p:any,tx:any[]){const m=parseRequest(p),of=tx.filter(t=>t.payable_id===p.id),sum=(k:string)=>{const n=of.filter(t=>t.kind===k&&t.status==='verified').reduce((s,t)=>s+BigInt(t.amount_rial),BigInt(0));requirePayment(n<=BigInt(Number.MAX_SAFE_INTEGER),'جمع رویدادهای این تعهد از دقت مجاز بیشتر است.');return Number(n)},gross=sum('payment')+sum('transfer')+tx.filter(t=>t.salary_payable_id===p.id&&t.kind==='payroll_deduction'&&t.status==='verified').reduce((s,t)=>s+t.amount_rial,0),returned=sum('payment_return'),paid=gross-returned,repayments=sum('repayment')+sum('payroll_deduction'),pending=of.filter(t=>['payment','transfer'].includes(t.kind)&&t.status==='reported').reduce((s,t)=>s+t.amount_rial,0),approved=m?.approval?.amount_rial??m?.recognized_rial??0;return {approved_rial:approved,gross_rial:gross,returned_rial:returned,paid_rial:paid,pending_rial:pending,balance_rial:Math.max(0,approved-paid),repayments_rial:repayments,employee_balance_rial:m?.nature==='employee_receivable'?Math.max(0,paid-repayments):null};}
export function projectedBankState(p:any,tx:any[]){const m=parseRequest(p),of=tx.filter(t=>t.payable_id===p.id||t.salary_payable_id===p.id);return of.some(t=>t.status==='reported'&&m.transaction_reviews?.[t.id]?.status==='mismatch')?'mismatch':of.some(t=>t.status==='reported')?'pending':of.some(t=>t.status==='verified'&&t.kind!=='payroll_deduction')?'verified':of.some(t=>t.status==='verified'&&t.kind==='payroll_deduction')?'documented':'none';}
export function requestStatus(p:any,tx:any[]){const m=parseRequest(p),t=paymentTotals(p,tx);if(['draft','submitted','review','correction','approval','suspended','rejected','cancelled'].includes(m.request_state))return m.request_state;if(projectedBankState(p,tx)==='mismatch')return 'mismatch';if(tx.some(t=>t.payable_id===p.id&&t.status==='reported'))return 'reported';if(t.balance_rial===0&&t.approved_rial>0)return m.settlement?.cash_signature===cashSignature(tx.filter(t=>t.payable_id===p.id||t.salary_payable_id===p.id))?'settled':'paid';return t.paid_rial>0?'partial':m.execution_state==='ready'?'ready':'approved';}
export const cashSignature=(tx:any[])=>JSON.stringify(tx.map(t=>[t.id,t.status,t.kind,t.amount_rial,t.revision]).sort((a,b)=>a[0].localeCompare(b[0])));

// Cross-obligation offsets are linked by the canonical audit event, without copying a payment.
export const paymentTransactionsSQL="SELECT t.*,COALESCE((SELECT json_extract(e.body,'$.salary_id') FROM finance_events e WHERE e.action='payment-request:deduction' AND json_extract(e.body,'$.result_id')=t.id LIMIT 1),'') salary_payable_id FROM finance_transactions t";
