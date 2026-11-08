import { getChatGPTUser } from './chatgpt-auth';
import { legacy } from '../lib/legacy';
import { identity } from '../lib/staff-server';
import { entryPage,escapeHtml } from '../lib/entry';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const account=await getChatGPTUser();
 if(!account)return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2F',req.url));
 const user=await identity();
 if(!user)return Response.redirect(new URL('/staff',req.url));
 const html=user.manager?legacy['index.html'].replace('<span class="avatar">HE</span>',`<span class="account-name">${escapeHtml(user.name)}</span><span class="avatar" aria-hidden="true">${escapeHtml(user.name.slice(0,1))}</span>`):entryPage(user);
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
