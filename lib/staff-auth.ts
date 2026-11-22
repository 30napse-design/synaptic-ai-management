import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {COOKIE_NAME,SESSION_SECONDS} from './auth-policy';
const database=()=>{if(!env.DB)throw Error('DB unavailable');return env.DB};
const secret=()=>{const v=(env as any).STAFF_AUTH_PEPPER;if(!v)throw Error('Authentication unavailable');return v as string};
export const hex=(value:ArrayBuffer|Uint8Array)=>Array.from(value instanceof Uint8Array?value:new Uint8Array(value),b=>b.toString(16).padStart(2,'0')).join('');
export const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(text:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))}
export async function passwordHash(password:string,salt:string){const input=await crypto.subtle.importKey('raw',new TextEncoder().encode(password+'\u0000'+secret()),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},input,256))}
export function equal(a:string,b:string){let result=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)result|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return result===0}
export async function localSession(){const jar=await cookies();const token=jar.get(COOKIE_NAME)?.value;if(!token||!/^[0-9a-f]{64}$/.test(token))return null;const hash=await digest(token);const a=await database().prepare('SELECT a.username,a.member_id,a.must_change,a.permissions,m.name,m.role FROM staff_sessions s JOIN staff_accounts a ON a.username=s.username JOIN staff_members m ON m.email=a.member_id WHERE s.token_hash=? AND s.expires_at>? AND m.active=1').bind(hash,Date.now()).first<any>();return a?{...a,tokenHash:hash}:null}
export function sessionCookie(token:string,maxAge=SESSION_SECONDS){
  // Google OAuth redirects return from accounts.google.com via a top-level GET.
  // SameSite=Strict drops the owner session on that callback; Lax preserves it.
  // Keep Strict for the original Sites runtime; the OAuth state/PKCE is validated separately.
  const sameSite=process.env.SYNAPSE_STANDALONE_BUILD==='1'?'Lax':'Strict';
  return `${COOKIE_NAME}=${token}; Path=/; Secure; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}`;
}
export async function newSession(username:string){const token=randomToken();await database().prepare('INSERT INTO staff_sessions(token_hash,username,expires_at) VALUES(?,?,?)').bind(await digest(token),username,Date.now()+SESSION_SECONDS*1000).run();return token}
export async function rateAllowed(id:string,max:number,windowMs=15*60*1000){const now=Date.now();const r=await database().prepare('INSERT INTO staff_auth_limits(id,count,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN staff_auth_limits.expires_at<? THEN 1 ELSE staff_auth_limits.count+1 END,expires_at=CASE WHEN staff_auth_limits.expires_at<? THEN excluded.expires_at ELSE staff_auth_limits.expires_at END RETURNING count').bind(id,now+windowMs,now,now).first<any>();return r.count<=max}
