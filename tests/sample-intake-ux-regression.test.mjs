import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sample=readFileSync('components/laboratory/researcher-sample-intake.tsx','utf8');
const stats=readFileSync('components/laboratory/sample-intake-dashboard.tsx','utf8');
const data=readFileSync('lib/researcher-sample-intake.ts','utf8');
const formCss=readFileSync('components/laboratory/researcher-sample-intake.module.css','utf8');
const header=readFileSync('components/workspace/account-menu.tsx','utf8');
const toolbar=readFileSync('components/workspace/shared-toolbar.css','utf8');
const operations=readFileSync('app/operations/operations-app.tsx','utf8');
const opsData=readFileSync('lib/operations-data.ts','utf8');
const cases=readFileSync('components/laboratory/laboratory-center.tsx','utf8');

test('existing sample-specific fields and three-stage custody workflow remain',()=>{
 for(const label of ['دارو یا ماده تیمار','مقدار هر واحد','واحد مقدار','شرایط حمل','آزمایشگاه مقصد','ردیف سفارش','اعلام ارسال محموله','دریافت واقعی','بررسی کارشناس پذیرش'])assert.ok(sample.includes(label),label);
 for(const action of ["intake_item","intake_shipment","intake_receive","intake_review"])assert.ok(data.includes(action),action);
});
test('real sample records are derived from authorized mother-case snapshots',()=>{
 assert.match(data,/const overview=projects.flatMap/);
 assert.match(data,/mother\?\.inventory/);
 assert.match(data,/\.slice\(0,100\)/);
 assert.match(data,/return \{projects,selected,overview,can_receive:true\}/);
 assert.match(sample,/<SampleIntakeRecords records=\{data\.overview\|\|\[\]\}/);
 assert.match(stats,/registered-samples/);
 assert.doesNotMatch(stats,/Math\.random/);
});
test('samples have a direct link to existing approved custody tab without new endpoint',()=>{
 assert.match(stats,/caseTab=samples/);
 assert.match(cases,/initialTab=\{initialQuery\.caseTab==='samples'\?2:0\}/);
});
test('responsive layout and account toolbar still expose existing profile and actions',()=>{
 assert.match(formCss,/workspaceGrid/);
 assert.match(formCss,/max-width:980px/);
 assert.match(header,/href="\/account"/);
 assert.match(header,/accountRoleEnglish/);
 assert.match(toolbar,/mail-blue/);
 assert.match(toolbar,/ai-trigger/);
 assert.match(toolbar,/work-notifications/);
});
test('reception now uses only approved taxonomy subject and owner dropdowns in the new filter panel',()=>{
 assert.match(operations,/<UnifiedIntakeFilters/);
 assert.doesNotMatch(operations,/فیلتر وضعیت مدارک/);
 assert.match(opsData,/unifiedGroup/);
 assert.match(opsData,/unifiedTopic/);
});
