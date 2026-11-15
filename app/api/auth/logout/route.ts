import {getChatGPTUser} from '../../../chatgpt-auth';
import {db,json,mutationAllowed} from '../../../../lib/staff-server';
import {localSession,sessionCookie} from '../../../../lib/staff-auth';
export async function POST(req:Request){if(!mutationAllowed(req))return json({error:'درخواست نامعتبر'},403);const a=await localSession();if(a)await db().prepare('DELETE FROM staff_sessions WHERE token_hash=?').bind(a.tokenHash).run();const platform=await getChatGPTUser();return Response.json({ok:true,next:platform?'/signout-with-chatgpt?return_to=%2Flogin':'/login'},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}})}
