import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const app=read('app/operations/operations-app.tsx');
const form=read('components/operations/operations-intake-form.tsx');
const sql=read('lib/operations-data.ts');
const sample=read('lib/standalone-sample-intake.ts');
const sheet=read('components/laboratory/independent-sample-intake.tsx');
const work=read('app/staff/work-app.tsx');

test('shared authorized intake form handles outbound and visits without replacing ticket flow',()=>{
 assert.match(app,/modal==='create'\?\(tickets\?<form onSubmit=/);
 assert.match(app,/<OperationsIntakeForm/);
 assert.match(app,/filters.new==='outbound'\?'email-out'/);
 assert.match(app,/filters.new==='visit'\?'visit'/);
 assert.match(form,/siteTopic:''/);
 assert.match(form,/matchingLegacySubtype/);
 assert.match(form,/memberPositionLabel/);
 assert.match(form,/شرح تماس \/ درخواست مشتری/);
 assert.match(form,/پاسخ پشتیبان \/ اقدام یا قول داده\u200cشده/);
});
test('daily operations hide manager bulk UI but ticket desk retains authorized group control',()=>{
 // Group control is still gated: only items passing assignable() (manual-assignment authority or own item) can be selected,
 // and the bulk panel appears on the ticket desk only once such items are selected (approved compact TKT desk).
 assert.match(app,/const assignable=\(item:any\)=>\(data\.manualAssignment\|\|/);
 assert.match(app,/tickets&&\(checked\.length>0\|\|bulkResults\.length>0\)&&<details/);
 assert.match(app,/tickets&&assignable\(item\)&&<input type="checkbox"/);
 assert.match(app,/ticket-bulk-panel/);
});
test('operations topic filter matches recorded newline line, escaped, with legacy subtype',()=>{
 assert.match(sql,/source_body LIKE \? ESCAPE/);
 assert.match(sql,/String\.fromCharCode\(10\)\+'موضوع درخواست: '/);
 assert.match(sql,/topic\.replace/);
 assert.match(sql,/subtype=\?/);
 const scoped=sql.slice(sql.indexOf("if(view!=='tickets'&&p.get('opsGroup'))"),sql.indexOf("if(p.get('channel'))"));
 assert.doesNotMatch(scoped,/substr\(source_body,1,\?\)=\?/);
});
test('requested labs are suggestions, only active IDs may be stored, no automatic dispatch',()=>{
 assert.match(sheet,/name="requested_labs"/);
 assert.match(sheet,/fd\.getAll\('requested_labs'\)/);
 assert.match(sample,/requested_labs:requestedLabs/);
 assert.match(sample,/allowedLabs\.has\(id\)/);
 assert.match(sample,/b.action==='send'/);
 assert.match(sample,/b.action==='lab_receive'/);
 assert.match(sample,/original\.lab_id===u\.laboratoryId/);
 assert.match(sample,/original\.status==='received'/);
});
test('current dashboard and historic workflow remain present',()=>{
 assert.match(work,/WorkCommandDashboard/);
 assert.match(read('app/(workspace)/sample-intake/page.tsx'),/ResearcherSampleIntake/);
 assert.match(read('components/operations/ticket-dashboard.tsx'),/ticket-dashboard-cards/);
});
