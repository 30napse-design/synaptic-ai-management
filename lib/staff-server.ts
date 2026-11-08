import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { OWNER } from './staff-policy';
import {localSession} from './staff-auth';
export const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function db(){if(!env.DB)throw new Error('پایگاه داده در دسترس نیست');return env.DB}
export async function identity(){const a=await localSession();if(a){if(a.must_change)return null;return {email:a.member_id,userId:'staff:'+a.username,username:a.username,name:a.name,role:a.role,manager:false,permissions:JSON.parse(a.permissions),local:true}}const u=await getChatGPTUser();if(!u)return null;const email=u.email.toLowerCase();if(email===OWNER)return {email,userId:u.userId,name:u.fullName||u.displayName||'مدیر سامانه',role:'manager',manager:true,permissions:['people','projects','lab','mail'],local:false};const m=await db().prepare('SELECT * FROM staff_members WHERE email=? AND active=1').bind(email).first<any>();if(!m)return null;if(m.user_id&&m.user_id!==u.userId)return null;if(!m.user_id)await db().prepare('UPDATE staff_members SET user_id=? WHERE email=? AND user_id IS NULL').bind(u.userId,email).run();return {email,userId:u.userId,name:m.name,role:m.role,manager:false,permissions:['people'],local:false}}
export function mutationAllowed(req:Request){const origin=req.headers.get('origin');return origin===new URL(req.url).origin&&req.headers.get('content-type')?.includes('application/json')}
export async function eventStmt(recordId:string,actor:string,action:string,body:string){return db().prepare('INSERT INTO staff_events (id,record_id,actor,action,body,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),recordId,actor,action,body,new Date().toISOString())}
export function row(r:any){return {...r,sourceUrl:r.source_url,evidenceUrl:r.evidence_url,createdBy:r.created_by,updatedAt:r.updated_at,checks:JSON.parse(r.checks||'[]')}}
