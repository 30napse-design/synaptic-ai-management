import {db} from './staff-server';
import {day,integer,str} from './finance-policy';
import {bankMust,bankSchemaReady} from './bank-policy';
import {bankCanonical} from './bank-matching';
import {digest} from './staff-auth';
// One insertion engine for the old API and the audited file workflow.
export async function prepareBankRows(account:string,rows:any[],source?:any){
 bankMust(str(account,180,true)&&Array.isArray(rows)&&rows.length<=500,'حساب و حداکثر ۵۰۰ ردیف در هر دسته معتبر باشد.');const metadata=await bankSchemaReady(),statements:any[]=[],existing=(await db().prepare('SELECT account,date,reference,amount_rial FROM finance_bank_rows WHERE account=?').bind(account).all()).results as any[];
 for(const row of rows){bankMust(day(row.date)&&!!row.date&&str(row.reference,180,true)&&str(row.description||'',2000)&&integer(Math.abs(row.amount_rial),1,9000000000000000),'تاریخ، شناسه و مبلغ بانک معتبر نیست.');const same=existing.filter(r=>bankCanonical(r.reference)===bankCanonical(row.reference));if(same.some(r=>r.date===row.date&&r.amount_rial===row.amount_rial))continue;if(source&&same.length)continue;
 const hash=await digest(JSON.stringify([bankCanonical(account),row.date,bankCanonical(row.reference),row.amount_rial])),id='bankrow:'+hash,at=new Date().toISOString(),reference=source?bankCanonical(row.reference):row.reference,meta=source?JSON.stringify({...source,source_reference:row.reference,classification:'unknown'}):'{}';
 statements.push(db().prepare('INSERT OR IGNORE INTO finance_bank_rows(id,bank_key,account,date,amount_rial,reference,description,created_at'+(metadata?',bank_meta':'')+') SELECT ?,?,?,?,?,?,?,?'+(metadata?',?':'')+(source?" WHERE NOT EXISTS(SELECT 1 FROM finance_bank_rows WHERE account=? AND lower(trim(reference))=? AND (date<>? OR amount_rial<>?))":'')).bind(id,hash,account,row.date,row.amount_rial,reference,row.description||'',at,...(metadata?[meta]:[]),...(source?[account,bankCanonical(row.reference),row.date,row.amount_rial]:[])));
 }return statements;
}
