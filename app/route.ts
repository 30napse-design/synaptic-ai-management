import { getChatGPTUser } from './chatgpt-auth';
import { legacy } from '../lib/legacy';
export const dynamic='force-dynamic';
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.redirect(new URL('/signin-with-chatgpt?return_to=/', 'https://synapse-command-center.ekramiihamid.chatgpt.site'));if(u.email.toLowerCase()!=='ekramiihamid@gmail.com')return Response.redirect('https://synapse-command-center.ekramiihamid.chatgpt.site/staff');return new Response(legacy['index.html'],{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
