import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const app=read('app/operations/operations-app.tsx');
const form=read('components/operations/operations-intake-form.tsx');
const ops=read('lib/operations-data.ts');
const samplePage=read('app/(workspace)/sample-intake/page.tsx');
const sample=read('components/laboratory/independent-sample-intake.tsx');
const sampleData=read('lib/standalone-sample-intake.ts');
const work=read('app/staff/work-app.tsx');
const nav=read('lib/navigation.ts');
test('approved admissions form for incoming, outgoing and visits, no duplicate bulk-selection controls',()=>{
 assert.match(app,/tickets\?<form onSubmit=/);
 assert.doesNotMatch(app,/tickets\|\|isVisit\|\|isOutbound\?<form/);
 assert.match(app,/false&&data\.manualAssignment/);
 assert.match(app,/false&&assignable\(item\)/);
 assert.match(form,/label>دسته اصلی<select/);
 assert.match(form,/label>موضوع درخواست<select/);
 assert.match(form,/siteTopic:''/);
 assert.match(form,/cat\?\.topics\.map/);
 assert.match(form,/matchingLegacySubtype/);
 assert.match(form,/شرح تماس \/ درخواست مشتری/);
 assert.match(form,/پاسخ پشتیبان \/ اقدام یا قول داده‌شده/);
});
test('operations SQL filters exact selected topic as line inside persisted transcript, no incorrect start-of-body assumption',()=>{
 assert.match(ops,/source_body LIKE \?/);
 assert.match(ops,/موضوع درخواست: /);
 assert.doesNotMatch(ops,/substr\(source_body,1,\?\)=\?/);
});
test('independent sample intake is primary, invoice / mother case optional, no loss of legacy history',()=>{
 assert.match(samplePage,/<IndependentSampleIntake\/>/);
 assert.match(samplePage,/params\.legacy==='1'/);
 assert.match(samplePage,/<ResearcherSampleIntake/);
 assert.match(sample,/ثبت و ایجاد برگه نمونه/);
 assert.match(sample,/برگه مشخصات نمونه‌ها/);
 assert.match(sampleData,/kind='sample_intake'/);
 assert.doesNotMatch(sampleData,/motherProject\(|invoice_number/);
});
test('sample custody requires physical receipt before manager lab dispatch and destination lab confirmation',()=>{
 for(const action of ['create','add_sample','receive','send','lab_receive'])assert.match(sampleData,new RegExp("b.action==='"+action+"'"));
 assert.match(sampleData,/original\.status==='registered'/);
 assert.match(sampleData,/original\.status==='received'/);
 assert.match(sampleData,/original\.status==='sent'/);
 assert.match(sampleData,/original\.lab_id===u\.laboratoryId/);
 assert.match(sampleData,/revision=revision\+1/);
 assert.match(sampleData,/WHERE id=\? AND status='active'/);
});
test('real work dashboard retains staff API and original work editor, with no invented counts',()=>{
 assert.match(work,/WorkCommandDashboard data=\{data\}/);
 assert.match(work,/view==='dashboard'/);
 assert.match(work,/fetch\('\/api\/work'/);
 assert.match(nav,/item\('کارتابل وظایف','\/staff\?view=dashboard'\)/);
 const ui=read('components/workspace/work-command-dashboard.tsx');
 assert.match(ui,/calendarDays\(anchor,'month'\)/);
 assert.match(ui,/data\.records\|\|\[\]/);
 assert.match(ui,/\.slice\(0,50\)/);
 assert.doesNotMatch(ui,/Math\.random\(/);
});
test('existing APIs are preserved and sample endpoint requires authenticated mutation',()=>{
 assert.ok(existsSync('app/api/operations/route.ts'));
 assert.ok(existsSync('app/api/sample-intake/route.ts'));
 assert.ok(existsSync('app/api/sample-intake/independent/route.ts'));
 assert.ok(existsSync('app/api/work/route.ts'));
 const api=read('app/api/sample-intake/independent/route.ts');
 assert.match(api,/mutationAllowed\(req\)/);
 assert.match(api,/identity\(\)/);
});

test('sample-sheet lab preference checkboxes are only suggestions and require later approved physical dispatch',()=>{
 assert.match(sample,/name="requested_labs"/);
 assert.match(sample,/requested_labs=fd\.getAll/);
 assert.match(sampleData,/requested_labs:requestedLabs/);
 assert.match(sampleData,/activeLabs|allowedLabs/);
 assert.match(sampleData,/original\.status==='received'/);
 assert.match(sampleData,/assignAccess\(u\)/);
});
