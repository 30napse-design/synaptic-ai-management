import {requestOrigin} from '../../lib/request-origin';
import {safeAuthReturnPath} from '../../lib/auth-redirect';
// Compatibility for an old bookmark/link, not an identity proxy or auth bypass.
export async function GET(req:Request){
 if(process.env.SYNAPSE_STANDALONE_BUILD!=='1')return new Response(null,{status:404});
 const url=new URL('/login',requestOrigin(req));
 url.searchParams.set('return_to',safeAuthReturnPath(new URL(req.url).searchParams.get('return_to')));
 return Response.redirect(url,303);
}
