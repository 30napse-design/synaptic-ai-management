import {env} from 'cloudflare:workers';
import {json} from '../../../../lib/staff-server';
import {equal} from '../../../../lib/staff-auth';
import {importOperations} from '../../../../lib/ops-server';
export async function POST(req:Request){const token=(env as any).STAFF_OPS_SETUP_TOKEN;if(!token||!equal(req.headers.get('x-synapse-ops')||'',token))return json({error:'Not found'},404);try{const b:any=await req.json();return json({ok:true,...await importOperations(b.items||[],'management',String(b.source||'initial-import').slice(0,60))})}catch(e:any){return json({error:e.message},e.retryable?409:400)}}
