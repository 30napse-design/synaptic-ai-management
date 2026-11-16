import {identity,json} from '../../../../../lib/staff-server';
import {requireOwner} from '../../../../../lib/integration-store';
import {googleCallback} from '../../../../../lib/google-input';
export async function GET(req:Request){try{requireOwner(await identity());return await googleCallback(req)}catch(e:any){return json({error:e.status?e.message:'اتصال تأیید نشد.'},e.status||502)}}
