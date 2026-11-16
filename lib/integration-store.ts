import {env} from 'cloudflare:workers';
import {db,eventStmt} from './staff-server';
import {OWNER} from './staff-policy';
export class IntegrationError extends Error {constructor(message:string,public status=400){super(message)}}
export function requireOwner(u:any){if(!u||u.laboratory||!u.manager||u.email!==OWNER)throw new IntegrationError('فقط مالک سامانه مجاز است.',403)}
export const check=(v:any,m:string,s=400)=>{if(!v)throw new IntegrationError(m,s)};
export const stamp=()=>new Date().toISOString();
export async function limitedText(req:Request,max:number){check(Number(req.headers.get('content-length')||0)<=max,'بدنه بیش از حد بزرگ است.',413);const reader=req.body?.getReader();if(!reader)return '';let total=0,text='';const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;total+=part.value.length;if(total>max){await reader.cancel();throw new IntegrationError('بدنه بیش از حد بزرگ است.',413)}text+=decoder.decode(part.value,{stream:true})}return text+decoder.decode()}
export async function setting(id:string,fallback:any=null){const r=await db().prepare('SELECT value FROM staff_auth_settings WHERE id=?').bind(id).first<any>();return r?JSON.parse(r.value):fallback}
export const storeSetting=(id:string,value:any)=>db().prepare('INSERT INTO staff_auth_settings(id,value) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind(id,JSON.stringify(value));
export const enc=(b:Uint8Array)=>btoa(String.fromCharCode(...b));
export const dec=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export const cryptoReady=()=>typeof (env as any).SYNAPSE_INTEGRATION_KEY==='string'&&(env as any).SYNAPSE_INTEGRATION_KEY.length>=32;
async function key(){check(cryptoReady(),'ذخیره امن نیازمند Secret سمت سرور SYNAPSE_INTEGRATION_KEY است.',503);return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode((env as any).SYNAPSE_INTEGRATION_KEY)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function seal(id:string,value:string){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(id)},await key(),new TextEncoder().encode(value));return {iv:enc(iv),data:enc(new Uint8Array(data))}}
export async function unseal(id:string,v:any){if(!v)return '';return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:dec(v.iv),additionalData:new TextEncoder().encode(id)},await key(),dec(v.data)))}
export async function audit(u:any,id:string,action:string,detail:any){await (await eventStmt(id,u.email,action,JSON.stringify(detail))).run()}
