import {isPrimaryOwner} from './work-assignment-policy';
import {db} from './staff-server';
import {organizationReady} from './org-access';
import {orgRoleKeys,instituteDirector} from './org-role-catalog';
import {resolveWorkflowOwner,readWorkflow} from './workflow-core';
export async function myOrganizationalResponsibilities(u:any){
 if(!await organizationReady()||u.laboratory)return {ready:false,roles:[],mode:'legacy'};
 const assignments=(await db().prepare('SELECT a.position_id,p.code FROM workflow_position_assignments a JOIN workflow_positions p ON p.id=a.position_id WHERE a.active=1 AND (a.primary_member_id=? OR a.substitute_member_id=?)').bind(u.email,u.email).all()).results as any[];
 const keys=[...new Set([...(u.orgRoles||[]),...assignments.map(a=>a.code).filter(code=>orgRoleKeys.includes(code))])];const roles:any[]=[];if(isPrimaryOwner(u))roles.push({id:'management',code:'management',title:'رئیس پژوهشکده',version:1,definition:instituteDirector,supervisor:null,supervisor_position:null});
 for(const key of keys){const p=await db().prepare('SELECT * FROM workflow_positions WHERE code=?').bind(key).first<any>();if(!p?.active)continue;const definition=JSON.parse(p.role_definition);const supervisor=await resolveWorkflowOwner(definition.reports_to||'management');const appointment=await resolveWorkflowOwner(p.id);roles.push({id:p.id,code:p.code,title:p.title,version:p.revision+1,definition,supervisor:supervisor.owner,supervisor_position:definition.reports_to||'management',current_role_owner:appointment.owner})}
 return {ready:true,roles,proposed_roles:u.orgProposedRoles||[],mode:u.orgMode||'legacy',qualified:!!u.scientificQualified};
}
