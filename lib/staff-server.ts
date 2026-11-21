import { requestOrigin } from "./request-origin";
import {accountOrganization,organizationalRuntimeProfile} from './org-access';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { OWNER } from './staff-policy';
import {DEFAULT_PERMISSIONS,effectivePermissions} from './auth-policy';
import {localSession} from './staff-auth';
export const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function db(){if(!env.DB)throw new Error('پایگاه داده در دسترس نیست');return env.DB}
export async function identity(){const a=await localSession();if(a){if(a.must_change)return null;return withLaboratory({email:a.member_id,userId:'staff:'+a.username,username:a.username,name:a.name,role:a.role,manager:JSON.parse(a.permissions).includes('institute_admin'),permissions:JSON.parse(a.permissions),local:true})}const u=await getChatGPTUser();if(!u)return null;const email=u.email.toLowerCase();if(email===OWNER){const profile=await db().prepare('SELECT display_name FROM staff_profiles WHERE member_id=?').bind(email).first<any>();return {email,userId:u.userId,name:profile?.display_name||u.fullName||u.displayName||'مدیر سامانه',role:'manager',manager:true,permissions:['people','projects','lab','mail'],local:false}};const m=await db().prepare('SELECT * FROM staff_members WHERE email=? AND active=1').bind(email).first<any>();if(!m)return null;if(m.user_id&&m.user_id!==u.userId)return null;if(!m.user_id)await db().prepare('UPDATE staff_members SET user_id=? WHERE email=? AND user_id IS NULL').bind(u.userId,email).run();return withLaboratory({email,userId:u.userId,name:m.name,role:m.role,manager:false,permissions:DEFAULT_PERMISSIONS,local:false})}
export function mutationAllowed(req:Request){const origin=req.headers.get('origin');return origin===requestOrigin(req)&&req.headers.get('content-type')?.includes('application/json')}
export async function eventStmt(recordId:string,actor:string,action:string,body:string){return db().prepare('INSERT INTO staff_events (id,record_id,actor,action,body,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),recordId,actor,action,body,new Date().toISOString())}
export function row(r:any){return {...r,sourceUrl:r.source_url,evidenceUrl:r.evidence_url,createdBy:r.created_by,updatedAt:r.updated_at,checks:JSON.parse(r.checks||'[]')}}

async function withLaboratory(user:any){user=organizationalRuntimeProfile({...user,...await accountOrganization(user.email)});user={...user,dataPermissions:user.permissions,permissions:effectivePermissions(user.permissions)};const lab=await db().prepare('SELECT l.id,l.type,l.name,l.status FROM laboratory_members m JOIN laboratories l ON l.id=m.laboratory_id WHERE m.member_id=?').bind(user.email).first<any>();return lab?{...user,laboratory:true,manager:false,laboratoryId:lab.id,laboratoryType:lab.type,laboratoryName:lab.name,laboratoryStatus:lab.status,permissions:effectivePermissions(['lab_portal'])}:user}
