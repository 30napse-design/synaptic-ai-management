import {db} from './staff-server';
import {canSeeOps} from './ops-policy';
import {canFinance} from './finance-policy';
import {canReadLabJob,canEnterLabs} from './lab-execution-policy';
import {canReadScience} from './science-policy';
import {visible} from './staff-policy';
import {referenceKey,workflowMust,WorkflowReference} from './workflow-policy';

// Only existing, typed primary keys are followed. Project membership is shared and is never
// expanded backwards into other researchers' orders. No name/phone/reference-text matching.
const referenceSQL:Record<string,string>={
 operation:'SELECT * FROM ops_items WHERE id=?',
 finance_document:'SELECT * FROM finance_documents WHERE id=?',
 finance_version:'SELECT * FROM finance_versions WHERE id=?',
 payment:"SELECT * FROM finance_transactions WHERE id=? AND kind IN ('receipt','refund')",
 lab_job:'SELECT j.*,l.type laboratory_type FROM laboratory_jobs j LEFT JOIN laboratories l ON l.id=j.laboratory_id WHERE j.id=?',
 sample:"SELECT * FROM laboratory_records WHERE id=? AND kind='sample'",
 lab_result:"SELECT * FROM laboratory_records WHERE id=? AND kind='result'",
 project:"SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id WHERE r.id=? AND r.kind='project'",
 task:"SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id WHERE r.id=? AND r.kind IN ('task','plan','decision','scientific')",
 correspondence:"SELECT r.*,w.details FROM staff_records r LEFT JOIN staff_work_details w ON w.record_id=r.id WHERE r.id=? AND r.kind='correspondence'",
 science_case:'SELECT * FROM science_cases WHERE id=?',
 science_result:"SELECT * FROM science_entries WHERE id=? AND kind IN ('data','report')"
};
export type WorkflowNode=WorkflowReference&{row:any};
export async function workflowReady(){return Number((await db().prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name IN ('research_people','research_orders','workflow_positions','workflow_position_assignments','workflow_order_links')").first<any>())?.n)===5}
export async function workflowGraph(initial:WorkflowReference[]){
 const graph=new Map<string,WorkflowNode>(),seen=new Set<string>(),pending=[...initial];const direct=new Set(initial.map(referenceKey));
 const add=(type:string,id:any)=>{if(typeof id==='string'&&id&&!seen.has(type+':'+id))pending.push({type,id})};
 // Group ids by type; a large invoice does not create one D1 fetch per service/sample.
 while(pending.length){
  const groups=new Map<string,string[]>();for(const ref of pending.splice(0)){const key=referenceKey(ref);if(seen.has(key))continue;seen.add(key);workflowMust(Object.hasOwn(referenceSQL,ref.type),'نوع ارتباط معتبر نیست.');groups.set(ref.type,[...(groups.get(ref.type)||[]),ref.id])}
  const types=[...groups.keys()];if(!types.length)break;
  const loaded=await db().batch(types.map(type=>db().prepare(referenceSQL[type].replace(/WHERE ((?:r|j)\.)?id=\?/,(_,alias)=>'WHERE '+(alias||'')+'id IN (SELECT value FROM json_each(?))')).bind(JSON.stringify(groups.get(type)))));
  const edges:any[]=[];
  const queue=(sql:string,ids:string[])=>edges.push(db().prepare(sql).bind(JSON.stringify(ids)));
  for(let i=0;i<types.length;i++){
   const type=types[i],rows=loaded[i].results as any[],found=new Set(rows.map(r=>r.id));for(const id of groups.get(type)!)workflowMust(found.has(id)||!direct.has(type+':'+id),'سابقه مرتبط پیدا نشد.',404);
   for(const r of rows){graph.set(type+':'+r.id,{type,id:r.id,row:r});
    if(type==='finance_document'){add('finance_document',r.source_id);add('project',JSON.parse(r.payload).project_id)}
    else if(type==='finance_version'||type==='payment')add('finance_document',r.document_id);
    else if(type==='sample'||type==='lab_result')add('lab_job',r.job_id);
    else if(type==='science_case'){const p=JSON.parse(r.payload);for(const id of p.job_ids||[])add('lab_job',id);add('task',r.source_task_id);add('operation',r.source_operation_id);add('project',p.project_id)}
    else if(type==='science_result')add('science_case',r.case_id);
   }
   const ids=rows.map(r=>r.id);if(!ids.length)continue;
   if(type==='finance_document')queue(`SELECT 'finance_document' type,id FROM finance_documents WHERE source_id IN (SELECT value FROM json_each(?1))
    UNION ALL SELECT 'finance_version',id FROM finance_versions WHERE document_id IN (SELECT value FROM json_each(?1))
    UNION ALL SELECT 'payment',id FROM finance_transactions WHERE document_id IN (SELECT value FROM json_each(?1)) AND kind IN ('receipt','refund')
    UNION ALL SELECT CASE WHEN type LIKE 'lab-line:%' THEN 'lab_job' WHEN type='scientific' THEN 'task' ELSE 'operation' END,reference_id FROM finance_links WHERE document_id IN (SELECT value FROM json_each(?1)) AND (type LIKE 'lab-line:%' OR type='scientific' OR type='operation:'||reference_id)`,ids);
   else if(type==='lab_job')queue(`SELECT 'finance_document' type,document_id id FROM finance_links WHERE reference_id IN (SELECT value FROM json_each(?1)) AND type LIKE 'lab-line:%'
    UNION ALL SELECT CASE kind WHEN 'sample' THEN 'sample' ELSE 'lab_result' END,id FROM laboratory_records WHERE job_id IN (SELECT value FROM json_each(?1)) AND kind IN ('sample','result')
    UNION ALL SELECT 'science_case',c.id FROM science_cases c JOIN json_each(c.payload,'$.job_ids') j WHERE j.value IN (SELECT value FROM json_each(?1))
    UNION ALL SELECT 'science_case',v.case_id FROM science_versions v JOIN json_each(v.payload,'$.job_ids') j WHERE j.value IN (SELECT value FROM json_each(?1))`,ids);
   else if(type==='science_case')queue("SELECT 'science_result' type,id FROM science_entries WHERE case_id IN (SELECT value FROM json_each(?1)) AND kind IN ('data','report') UNION ALL SELECT 'lab_job',j.value FROM science_versions v JOIN json_each(v.payload,'$.job_ids') j WHERE v.case_id IN (SELECT value FROM json_each(?1))",ids);
   else if(type==='task')queue(`SELECT 'science_case' type,id FROM science_cases WHERE source_task_id IN (SELECT value FROM json_each(?1))
    UNION ALL SELECT 'finance_document',document_id FROM finance_links WHERE type='scientific' AND reference_id IN (SELECT value FROM json_each(?1))`,ids);
   else if(type==='operation')queue(`SELECT 'finance_document' type,document_id id FROM finance_links WHERE type='operation:'||reference_id AND reference_id IN (SELECT value FROM json_each(?1))
    UNION ALL SELECT 'science_case',id FROM science_cases WHERE source_operation_id IN (SELECT value FROM json_each(?1))`,ids);
  }
  if(edges.length)for(const result of await db().batch(edges))for(const r of result.results as any[])add(r.type,r.id);
 }
 return graph;
}

export async function readableWorkflowNode(u:any,n:WorkflowNode,graph:Map<string,WorkflowNode>){
 if(!u||u.laboratory)return false;if(u.manager)return true;const r=n.row;
 if(n.type==='operation')return canSeeOps(u,r);
 if(['finance_document','finance_version','payment'].includes(n.type))return canFinance(u);
 if(['project','task','correspondence'].includes(n.type))return visible({...r,...JSON.parse(r.details||'{}')},u);
 if(n.type==='lab_job')return canEnterLabs(u)&&canReadLabJob(u,r);
 if(n.type==='sample'||n.type==='lab_result'){const j=graph.get('lab_job:'+r.job_id)?.row;return !!j&&canEnterLabs(u)&&canReadLabJob(u,j)}
 if(n.type==='science_case')return canReadScience(u,r);
 if(n.type==='science_result'){const c=graph.get('science_case:'+r.case_id)?.row;return !!c&&canReadScience(u,c)}return false;
}
export function workflowNodeSummary(n:WorkflowNode){const r=n.row;let payload:any={};if(r.payload)payload=JSON.parse(r.payload);
 const result:any={type:n.type,id:n.id,title:r.title||r.number||r.work_code||payload.title||r.service||payload.code||n.type,status:r.status||payload.status||'',version:r.version||r.work_version||null};
 const paths:Record<string,string>={operation:'/operations?id='+encodeURIComponent(r.id),finance_document:'/finance/'+(r.kind==='quote'?'pricing':r.kind==='contract'?'contracts':'invoices'),lab_job:'/laboratories/'+(r.laboratory_type||'internal'),project:'/work/projects',task:'/staff?view=all',correspondence:'/work/mail',science_case:'/work/science?case='+encodeURIComponent(r.id)};
 if(paths[n.type])result.url=paths[n.type];
 if(n.type==='payment')Object.assign(result,{document_id:r.document_id,kind:r.kind,amount_rial:r.amount_rial,verified:r.status==='verified'});
 if(n.type==='finance_version')Object.assign(result,{document_id:r.document_id,version:r.version});
 if(n.type==='sample')Object.assign(result,{job_id:r.job_id,code:payload.code,sample_type:payload.sample_type,quantity:payload.quantity,received_quantity:payload.received_quantity,received_at:payload.received_at||'',status:payload.status});
 if(n.type==='lab_result')Object.assign(result,{job_id:r.job_id,kind:payload.kind,work_version:payload.work_version});
 if(n.type==='science_result')Object.assign(result,{science_case_id:r.case_id,kind:r.kind,version:r.target_version});
 return result;
}
export function workflowFamily(graph:Map<string,WorkflowNode>){return [...graph.values()].filter(n=>n.type!=='project').map(({type,id})=>({type,id}))}
export async function workflowConflicts(refs:WorkflowReference[],orderId=''){
 if(!refs.length)return [];return (await db().prepare("SELECT DISTINCT l.order_id FROM workflow_order_links l JOIN json_each(?) e ON l.target_type=json_extract(e.value,'$.type') AND l.target_id=json_extract(e.value,'$.id') WHERE l.retired_at='' AND l.order_id!=?").bind(JSON.stringify(refs),orderId).all()).results as any[];
}
// Shared relationship writers call this guard; before migration their existing behavior remains available.
export async function assertWorkflowCompatible(refs:WorkflowReference[]){if(!await workflowReady())return;const graph=await workflowGraph(refs);const owners=await workflowConflicts(workflowFamily(graph));workflowMust(new Set(owners.map(r=>r.order_id)).size<=1,'سوابق به سفارش‌های مرکزی متفاوت تعلق دارند؛ تطبیق مدیریتی لازم است.',409)}

export function workflowSnapshotGuard(graph:Map<string,WorkflowNode>){
 const tables:Record<string,string>={operation:'ops_items',finance_document:'finance_documents',payment:'finance_transactions',lab_job:'laboratory_jobs',sample:'laboratory_records',lab_result:'laboratory_records',project:'staff_records',task:'staff_records',correspondence:'staff_records',science_case:'science_cases'};
 const refs=[...graph.values()].filter(n=>tables[n.type]&&Number.isSafeInteger(n.row.revision)).map(n=>({type:n.type,id:n.id,revision:n.row.revision}));
 const branches=Object.entries(tables).map(([type,table])=>`(json_extract(e.value,'$.type')='${type}' AND NOT EXISTS(SELECT 1 FROM ${table} r WHERE r.id=json_extract(e.value,'$.id') AND r.revision=json_extract(e.value,'$.revision')))`);
 return {sql:'NOT EXISTS(SELECT 1 FROM json_each(?) e WHERE '+branches.join(' OR ')+')',args:[JSON.stringify(refs)]};
}
export async function workflowCompatibilityGuard(refs:WorkflowReference[]){
 if(!await workflowReady())return {sql:'1=1',args:[]};const graph=await workflowGraph(refs),family=workflowFamily(graph);const owners=await workflowConflicts(family);workflowMust(new Set(owners.map(r=>r.order_id)).size<=1,'سوابق به سفارش‌های مرکزی متفاوت تعلق دارند؛ تطبیق مدیریتی لازم است.',409);
 const snapshot=workflowSnapshotGuard(graph);return {sql:"((SELECT COUNT(DISTINCT l.order_id) FROM workflow_order_links l JOIN json_each(?) e ON l.target_type=json_extract(e.value,'$.type') AND l.target_id=json_extract(e.value,'$.id') WHERE l.retired_at='')<=1) AND "+snapshot.sql,args:[JSON.stringify(family),...snapshot.args]};
}

export async function workflowTransferGuard(paymentId:string,documentId:string){
 if(!await workflowReady())return {sql:'1=1',args:[]};const source=await workflowGraph([{type:'payment',id:paymentId}]),target=await workflowGraph([{type:'finance_document',id:documentId}]);const left=await workflowConflicts(workflowFamily(source)),right=await workflowConflicts(workflowFamily(target));
 if(left.length||right.length)workflowMust(source.has('finance_document:'+documentId)||left.length>0&&right.length>0,'پیش‌دریافت و سند مقصد باید به همان سفارش مرکزی متصل باشند.',409);
 return workflowCompatibilityGuard([{type:'payment',id:paymentId},{type:'finance_document',id:documentId}]);
}
