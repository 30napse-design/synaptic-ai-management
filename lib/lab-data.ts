import {db} from './staff-server';
import {publicLabJob} from './lab-policy';
export async function readLabData(u:any){const rows=await db().prepare('SELECT * FROM laboratory_jobs ORDER BY updated_at DESC LIMIT 2000').all();const members=await db().prepare('SELECT email,name FROM staff_members WHERE active=1 ORDER BY name').all();return {user:{email:u.email,name:u.name,manager:u.manager},jobs:rows.results.map(r=>publicLabJob(r,u.manager)),members:[{email:'ekramiihamid@gmail.com',name:'مدیریت'},...members.results]}}
