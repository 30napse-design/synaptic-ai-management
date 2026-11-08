import {db,json,mutationAllowed} from '../../../../lib/staff-server';
import {localSession,sessionCookie} from '../../../../lib/staff-auth';
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);const a=await localSession();if(a)await db().prepare('DELETE FROM staff_sessions WHERE token_hash=?').bind(a.tokenHash).run();return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}})}
