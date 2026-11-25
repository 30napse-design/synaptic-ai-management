import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
const home=read('components/workspace/personal-home.tsx');
const ops=read('app/api/operations/route.ts');
const dispatch=read('lib/dispatch-engine.ts');
const sheet=read('lib/standalone-sample-intake.ts');
const sampleUi=read('components/laboratory/independent-sample-intake.tsx');
test('staff home offers role-scoped direct specimen sheet and personal work desk',()=>{
 assert.match(home,/hasAccess\(u,'sample_intake'\)/);
 assert.match(home,/href:'\/sample-intake'/);
 assert.match(home,/href:'\/staff\?view=dashboard'/);
 assert.match(home,/href:'\/operations\?new=call'/);
 assert.match(home,/href:'\/operations\?new=request'/);
 assert.doesNotMatch(home,/docs\.google\.com\/spreadsheets/);
});
test('real operational request creates stable tasks via active authorized positions',()=>{
 assert.match(ops,/dispatchReady\(\)/);
 assert.match(ops,/dispatchWrite\(u,/);
 assert.match(dispatch,/classifyCommunication\(/);
 assert.match(dispatch,/await position\(role\)/);
 assert.match(dispatch,/tid='dispatch:'\+id\+':'\+role/);
 assert.match(dispatch,/INSERT OR IGNORE INTO staff_records/);
 assert.match(dispatch,/target\.missing/);
 assert.match(dispatch,/https:\/\/visionofresearch\.co\/operations\?view=dispatch&id=/);
 assert.doesNotMatch(dispatch,/https:\/\/synapse\.ekramiihamid\.chatgpt\.site\/operations\?view=dispatch&id=/);
});
test('real sample records remain independent of invoice with separate laboratory handoff',()=>{
 assert.match(sheet,/kind='sample_intake'/);
 assert.match(sheet,/requested_labs:requestedLabs/);
 assert.match(sheet,/original\.status==='received'/);
 assert.match(sheet,/original\.lab_id===u\.laboratoryId/);
 assert.match(sampleUi,/ثبت و ایجاد برگه نمونه/);
 assert.match(sampleUi,/await load\(target\)/);
 assert.match(sampleUi,/requested_labs/);
});
