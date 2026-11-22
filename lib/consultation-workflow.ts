/**
 * SYNAPSE consultation registry — shared vocabulary and transition rules.
 * Pure functions only. No writes, email dispatch, invoice mutations, or AI calls.
 * Deployment requires a separate persistence/API/UI implementation and approvals.
 */
export const consultationStages = {
  pre_execution: {
    label: 'مشاوره علمی و طراحی پیش از اجرا',
    ownerRole: 'scientific_manager',
    families: ['A02', 'A03', 'A11'],
    topics: ['study_design', 'markers', 'method', 'sample_plan', 'quote', 'invoice_revision', 'feasibility', 'protocol']
  },
  execution_review: {
    label: 'هماهنگی علمی، کنترل داده و مستندسازی حین اجرا',
    ownerRole: 'research_specialist',
    families: ['A07', 'A08', 'A13'],
    topics: ['lab_question', 'sample_issue', 'method_deviation', 'raw_data', 'qc', 'analysis', 'report_draft', 'documentation']
  },
  post_delivery: {
    label: 'پشتیبانی علمی و تفسیر نتایج پس از تحویل',
    ownerRole: 'research_manager',
    families: ['A09', 'A10'],
    topics: ['results_question', 'interpretation', 'missing_data', 'correction', 'reanalysis', 'additional_test', 'report_explanation']
  }
} as const;

export type ConsultationStage=keyof typeof consultationStages;
export type ConsultationStatus='new'|'triage'|'assigned'|'doing'|'waiting_customer'|'waiting_lab'|'waiting_internal'|'waiting_approval'|'resolved'|'closed'|'reopened';
export type ConsultationTopic=(typeof consultationStages)[ConsultationStage]['topics'][number];
export type ConsultationEvidence={type:'email'|'phone'|'file'|'lab_record'|'invoice'|'report'|'manual';reference:string;version?:string};
export type ConsultationRecord={
 id:string;stage:ConsultationStage;topic:string;status:ConsultationStatus;
 requestId:string;researchOrderId?:string;scienceCaseId?:string;invoiceId?:string;labJobId?:string;reportId?:string;
 contactEmail?:string;assignedRole:string;assignedMember?:string;question:string;
 evidence:ConsultationEvidence[];revision:number;createdAt:string;updatedAt:string;
};
export const consultationStatuses:ConsultationStatus[]=['new','triage','assigned','doing','waiting_customer','waiting_lab','waiting_internal','waiting_approval','resolved','closed','reopened'];
const allowed:Record<ConsultationStatus,ConsultationStatus[]>={
 new:['triage','assigned'],triage:['assigned','waiting_customer','waiting_lab'],
 assigned:['doing','waiting_customer','waiting_lab','waiting_internal'],doing:['waiting_customer','waiting_lab','waiting_internal','waiting_approval','resolved'],
 waiting_customer:['doing','waiting_approval'],waiting_lab:['doing','waiting_approval'],waiting_internal:['doing','waiting_approval'],
 waiting_approval:['doing','resolved'],resolved:['closed','reopened'],closed:['reopened'],reopened:['assigned','doing']
};
export function canTransitionConsultation(from:ConsultationStatus,to:ConsultationStatus){return allowed[from]?.includes(to)===true}
export function consultationTransitionRequiresApproval(to:ConsultationStatus){return to==='resolved'||to==='closed'}
export function consultationStageForFamily(family:string):ConsultationStage|null{
 if(['A02','A03','A11'].includes(family))return 'pre_execution';
 if(['A07','A08','A13'].includes(family))return 'execution_review';
 if(['A09','A10'].includes(family))return 'post_delivery';
 return null;
}
/** Prefer explicit, operator-confirmed stage; keyword rules are only suggestions. */
export function consultationSuggestedStage(topic:string, family=''):ConsultationStage|null{
 const familyStage=consultationStageForFamily(family);
 if(familyStage)return familyStage;
 for(const [stage,data] of Object.entries(consultationStages)){
  if((data.topics as readonly string[]).includes(topic))return stage as ConsultationStage;
 }
 return null;
}
export function validateConsultationDraft(input:Partial<ConsultationRecord>):string[]{
 const errors:string[]=[];
 if(!input.stage||!(input.stage in consultationStages))errors.push('مرحله معتبر لازم است.');
 else if(!input.topic||!(consultationStages[input.stage].topics as readonly string[]).includes(input.topic))errors.push('موضوع با مرحله سازگار نیست.');
 if(!input.question?.trim()||input.question.length>16000)errors.push('شرح درخواست بین ۱ تا ۱۶۰۰۰ نویسه لازم است.');
 if(!input.requestId?.trim())errors.push('شناسه درخواست مادر لازم است.');
 if(!input.assignedRole?.trim())errors.push('سمت مسئول لازم است.');
 if(!Array.isArray(input.evidence)||input.evidence.some(e=>!e.reference?.trim()))errors.push('شواهد باید دارای مرجع معتبر باشند.');
 return errors;
}
