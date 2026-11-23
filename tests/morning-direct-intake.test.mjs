import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(p,'utf8');
const home=source('components/workspace/personal-home.tsx');
const dispatch=source('lib/dispatch-engine.ts');
const sample=source('lib/standalone-sample-intake.ts');
const display=source('components/laboratory/independent-sample-intake.tsx');
test('home provides role-restricted direct sample sheet and personal assigned work desk, no Sheets dependency',()=>{
 assert.match(home,/hasAccess\(u,'sample_intake'\)/);
 assert.match(home,/href:'\/sample-intake'/);
 assert.match(home,/href:'\/staff\?view=dashboard'/);
 assert.doesNotMatch(home,/docs\.google\.com\/spreadsheets/);
});
test('new communication dispatch creates deterministic role-position work items',()=>{
 assert.match(dispatch,/classifyCommunication\(/);
 assert.match(dispatch,/await position\(role\)/);
 assert.match(dispatch,/tid='dispatch:'\+id\+':'\+role/);
 assert.match(dispatch,/\.\.\.await taskStatements\(/);
});
test('sample data persists in SYNAPSE and remains under custody and laboratory-only confirmation',()=>{
 assert.match(sample,/kind='sample_intake'/);
 assert.match(sample,/requested_labs:requestedLabs/);
 assert.match(sample,/original\.status==='received'/);
 assert.match(sample,/original\.lab_id===u\.laboratoryId/);
 assert.match(display,/ثبت و ایجاد برگه نمونه/);
 assert.match(display,/requested_labs/);
});
