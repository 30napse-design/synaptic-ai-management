import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialSupportData} from '../types/support-wizard.ts';
import {validateStep,validateFiles,selectCategory,maxFileBytes} from '../lib/validations/support-wizard-validation.ts';
import {unifiedIntakeCategories} from '../lib/unified-intake-taxonomy.ts';
const category=unifiedIntakeCategories[0],topic=category.topics[0];
const valid={...initialSupportData(),categoryId:category.id,topicTitle:topic.title,name:'علی محمدی',mobile:'۰۹۱۲۳۴۵۶۷۸۹',email:'test@example.test',description:'درخواست آزمون'};
test('approved categories and topics only; same category preserves topic',()=>{
 assert.ok(validateStep(1,initialSupportData()));
 assert.equal(validateStep(1,valid),'');
 assert.equal(validateStep(2,valid),'');
 assert.ok(validateStep(2,{...valid,topicTitle:'unknown'}));
 assert.deepEqual(selectCategory(valid,category.id),{});
 assert.deepEqual(selectCategory(valid,unifiedIntakeCategories[1].id),{categoryId:unifiedIntakeCategories[1].id,topicTitle:''});
});
test('required fields and Persian mobile validation',()=>{
 assert.equal(validateStep(3,valid),'');
 for(const field of ['name','mobile','email','description'])assert.ok(validateStep(3,{...valid,[field]:''}));
 assert.ok(validateStep(3,{...valid,mobile:'123'}));
 assert.ok(validateStep(3,{...valid,email:'invalid'}));
 assert.ok(validateStep(3,{...valid,followUpDate:'2026-02-30'},true));
 assert.equal(validateStep(3,{...valid,followUpDate:'2026-02-28'},true),'');
});
test('local attachments enforce count size extension and MIME',()=>{
 const pdf={name:'report.pdf',type:'application/pdf',size:100};
 assert.equal(validateFiles([pdf]),'');
 assert.ok(validateFiles([{...pdf,size:maxFileBytes+1}]));
 assert.ok(validateFiles([{...pdf,name:'report.exe'}]));
 assert.ok(validateFiles([{...pdf,type:'image/jpeg'}]));
 assert.ok(validateFiles(Array(6).fill(pdf)));
});
test('public wizard stays in preview while the authenticated staff entry shares the ticket API',()=>{
 const wizard=readFileSync('components/support/ResearcherSupportWizard.tsx','utf8');
 const app=readFileSync('app/operations/operations-app.tsx','utf8');
 const page=readFileSync('app/support/page.tsx','utf8');
 assert.doesNotMatch(wizard,/localStorage|sessionStorage|setTimeout\(/);
 assert.match(wizard,/if\(!live\|\|submitting.current\)return/);
 assert.match(wizard,/typeof result.trackingCode!=='string'/);
 assert.match(wizard,/Math.max\(1,s-1\)/);
 assert.match(app,/<TicketSupportCreate/);
 assert.match(app,/<ResearcherSupportWizard isInternalStaff onSaved=/);
 assert.match(page,/<ResearcherSupportWizard\/>/);
});
