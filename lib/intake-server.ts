import {db} from './staff-server';
import {DEFAULT_PERMISSIONS} from './auth-policy';
import {canSeeOps} from './ops-policy';
export async function intakeMembers(){const rr=await db().prepare('SELECT m.email,m.name,a.permissions FROM staff_members m LEFT JOIN staff_accounts a ON a.member_id=m.email WHERE m.active=1 ORDER BY m.name').all();return [{email:'ekramiihamid@gmail.com',name:'مدیریت',manager:true,permissions:[]},...rr.results.filter((m:any)=>m.email!=='ekramiihamid@gmail.com').map((m:any)=>({email:m.email,name:m.name,manager:false,permissions:m.permissions?JSON.parse(m.permissions):DEFAULT_PERMISSIONS}))]}
export async function validOpsAssignee(email:string,item:any){if(!email)return true;return (await intakeMembers()).some(m=>m.email===email&&canSeeOps(m,item))}
