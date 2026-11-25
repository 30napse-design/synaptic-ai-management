import {json} from '../../../../../lib/staff-server';
import {googleCallback} from '../../../../../lib/google-input';

// Starting OAuth is restricted to the owner by POST /api/integrations.
// On Google's cross-site redirect the local owner cookie may be unavailable.
// The callback is authorized by the server-stored, single-use, 10-minute OAuth
// state, matching source revision, and the PKCE verifier in googleCallback.
// Do not bypass those validations or accept any client-supplied source ID.
export async function GET(req:Request){
  try{
    return await googleCallback(req);
  }catch(e:any){
    return json({error:e.status?e.message:'اتصال تأیید نشد.'},e.status||502);
  }
}
