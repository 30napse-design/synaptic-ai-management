import {paymentRequestDueReview} from '../../../../lib/payment-request-calendar';
import {scanReceiptMatches} from '../../../../lib/finance-receipts';
import {sweepFinancialReminders} from '../../../../lib/finance-dashboard';
import {env} from 'cloudflare:workers';
import {json} from '../../../../lib/staff-server';
import {equal} from '../../../../lib/staff-auth';
import {sources,followup} from '../../../../lib/input-sources';
import {googlePoll} from '../../../../lib/google-input';
// Scheduler port; no visitor session or ChatGPT connector capability is assumed.
export async function POST(req:Request){const token=(env as any).SYNAPSE_AUTOMATION_TOKEN;if(!token||!equal(req.headers.get('x-synapse-automation')||'',token))return json({error:'Not found'},404);const results=[];for(const s of (await sources()).filter(s=>s.enabled&&['gmail_oauth','google_sheets'].includes(s.method))){try{results.push({id:s.id,...await googlePoll(s)})}catch{results.push({id:s.id,ok:false,error:'source-needs-review'})}}await followup();const financeReminders=await sweepFinancialReminders();const bankProposals=await scanReceiptMatches();const paymentDue=await paymentRequestDueReview();return json({ok:results.every(r=>r.ok),results,financeReminders,bankProposals,paymentDue})}
