import {hasDataAccess} from './auth-policy';
import {day} from './finance-policy';
export const workflowStates=['awaiting_order_confirmation','awaiting_scientific_preparation','awaiting_sample','ready_for_assignment','executing','awaiting_laboratory','blocked','awaiting_scientific_control','ready_for_delivery','completed','closed'] as const;
export const workflowReferenceTypes=['operation','finance_document','finance_version','payment','lab_job','sample','lab_result','project','task','correspondence','science_case','science_result'] as const;
export type WorkflowReference={type:string;id:string};
export const workflowActions=['researcher_save','order_save','position_save','position_assign','order_link','order_link_retire'];
export const workflowViews=['orders','researchers','positions'];
export class WorkflowError extends Error{constructor(message:string,public status=400){super(message)}}
export function workflowMust(value:any,message:string,status=400):asserts value{if(!value)throw new WorkflowError(message,status)}
export const workflowText=(v:any,n:number,required=false)=>typeof v==='string'&&v.length<=n&&(!required||!!v.trim());
export const workflowDate=(v:any)=>typeof v==='string'&&!!v&&day(v);
export const referenceKey=(r:WorkflowReference)=>r.type+':'+r.id;
export const workflowMemberPermission=(u:any,permission:string)=>!!u&&(u.manager||permission==='lab_portal'&&u.laboratory||hasDataAccess(u,permission));
// A stage-three consumer can identify/replay these durable audit events by id and aggregate revision.
// No polling, queue delivery, automatic state transition or AI classification is implemented here.
export function workflowEvent(aggregate:string,id:string,revision:number,change:any){return {schema_version:1,aggregate_type:aggregate,aggregate_id:id,aggregate_revision:revision,change}}
