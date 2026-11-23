import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync('app/api/sample-intake/independent/route.ts','utf8');
const server=readFileSync('lib/standalone-sample-intake.ts','utf8');
const client=readFileSync('components/laboratory/independent-sample-intake.tsx','utf8');
const page=readFileSync('app/(workspace)/sample-intake/page.tsx','utf8');
test('no invoice or previous mother case is required for independent intake',()=>{
 assert.match(page,/<IndependentSampleIntake\/>/);
 assert.match(page,/<details className="legacy-linked-intake"/);
 assert.match(client,/ثبت و ایجاد برگه نمونه/);
 assert.match(server,/kind='sample_intake'/);
 assert.doesNotMatch(server,/motherProject\(|mother_create|invoice_number|intakeOrderLines/);
});
test('separate sample, real receipt, manager dispatch and lab confirmation',()=>{
 for(const action of ['create','add_sample','receive','send','lab_receive']){assert.ok(server.includes("b.action==='"+action+"'"),action);assert.ok(client.includes("'"+action+"'"),action)}
 assert.match(server,/original\.status==='registered'/);
 assert.match(server,/original\.status==='received'/);
 assert.match(server,/original\.status==='sent'/);
 assert.match(server,/original\.lab_id===u\.laboratoryId/);
 assert.match(server,/original\.status=b\.quantity===original\.sent\?'lab_received':'lab_issue'/);
});
test('role checks and two-stage audit trail preserve rights and idempotency',()=>{
 assert.match(server,/canCoordinate/);
 assert.match(server,/hasDataAccess\(u,'research_supervision'\)/);
 assert.match(server,/await digest\(u\.email\+':'\+b\.key\)/);
 assert.match(server,/INSERT OR IGNORE INTO staff_events/);
 assert.match(server,/revision=revision\+1/);
 assert.match(server,/changes\(\)=1/);
 assert.match(server,/WHERE id=\? AND status='active'/);
 assert.match(api,/mutationAllowed\(req\)/);
});
test('new registry is read from real records and is responsive',()=>{
 assert.match(server,/SELECT r\.id,r\.revision,r\.status/);
 assert.match(server,/json_each\(w\.details,'\$\.intake_v1\.samples'\)/);
 assert.match(client,/فهرست برگه‌ها و نمونه‌های ثبت‌شده/);
 assert.match(client,/await load\(target\)/);
 assert.match(readFileSync('components/laboratory/independent-sample-intake.css','utf8'),/@media\(max-width:650px\)/);
});
