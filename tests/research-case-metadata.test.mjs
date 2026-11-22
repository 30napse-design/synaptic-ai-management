import test from 'node:test';
import assert from 'node:assert/strict';
import {
 projectKinds,projectPriorities,projectResponsibilityTypes,projectApproverTypes,
 projectExecutionStatuses,projectBlockerReasons,normalizeResearchCaseMetadata,projectGroup,
} from '../lib/research-case-metadata.ts';
test('approved form options match business decisions',()=>{
 assert.equal(projectKinds.length,4);
 assert.equal(projectPriorities.length,3);
 assert.equal(projectResponsibilityTypes.length,5);
 assert.equal(projectApproverTypes.length,2);
 assert.equal(projectExecutionStatuses.length,8);
 assert.ok(!projectExecutionStatuses.some(x=>x.title==='در انتظار تخصیص مجری'));
 assert.deepEqual(projectBlockerReasons.map(x=>x.title),[
  'بدون مانع','عدم واریز','عدم حدنصاب پرداخت','در انتظار اقلام محقق',
  'آماده‌سازی مواد','تخصیص یا تأیید مجری','اصلاح مستندات','سایر موارد'
 ]);
});
test('metadata has safe defaults and rejects fabricated role, approver or dates',()=>{
 assert.equal(normalizeResearchCaseMetadata({}).blocker_reason,'none');
 assert.equal(normalizeResearchCaseMetadata({project_kind:'thesis',priority:'urgent'}).priority,'urgent');
 assert.throws(()=>normalizeResearchCaseMetadata({approver_type:'random'}));
 assert.throws(()=>normalizeResearchCaseMetadata({responsibility_type:'staff1'}));
 assert.throws(()=>normalizeResearchCaseMetadata({execution_status:'awaiting_assignment'}));
 assert.throws(()=>normalizeResearchCaseMetadata({project_start:'2026-12-10',project_due:'2026-12-01'}));
});
test('case buckets preserve operational lifecycle independently of blocker labels',()=>{
 assert.equal(projectGroup('در حال اجرا'),'running');
 assert.equal(projectGroup('در انتظار تأیید مدیریت','unpaid'),'preparing');
 assert.equal(projectGroup('متوقف یا دارای مانع'),'paused');
 assert.equal(projectGroup('گزارش آماده'),'finishing');
 assert.equal(projectGroup('بسته‌شده'),'completed');
});
