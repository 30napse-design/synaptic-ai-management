import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const nav=readFileSync('lib/navigation.ts','utf8');
const ui=readFileSync('components/workspace/work-command-dashboard.tsx','utf8');
const css=readFileSync('components/workspace/work-command-dashboard.css','utf8');
const work=readFileSync('app/staff/work-app.tsx','utf8');
const data=readFileSync('lib/staff-data.ts','utf8');
const mail=readFileSync('components/workspace/work-correspondence-strip.tsx','utf8');
test('sidebar exposes exactly the four agreed work sections, while old links remain addressable',()=>{
 const group=nav.match(/\{id:'work',label:'کارتابل و برنامه‌ریزی',items:\[([^\]]+)\]\}/)?.[1]||'';
 assert.equal((group.match(/item\(/g)||[]).length,4);
 for(const label of ['برنامه‌ریزی','کارتابل وظایف','بررسی و تأیید','مکاتبات داخلی'])assert.ok(group.includes(label),label);
 assert.match(work,/overview:'امروز من'/);
 assert.match(work,/board:'برد وظایف'/);
});
test('dashboard uses existing real authorized staff records rather than synthetic entries',()=>{
 assert.match(ui,/data\.records\|\|\[\]/);
 assert.match(ui,/isWork\(r\)/);
 assert.match(ui,/participant\(r,data\.user\)/);
 assert.match(ui,/\.slice\(0,50\)/);
 assert.match(data,/const authorized=records\.filter/);
 assert.doesNotMatch(ui,/Math\.random\(/);
});
test('all work metrics are dynamically derived and clicked cards filter the actual list',()=>{
 for(const id of ['all','new','today','waiting','overdue','unassigned'])assert.match(ui,new RegExp("id:'"+id+"'"));
 assert.match(ui,/setMetric\(id\)/);
 assert.match(ui,/metric==='overdue'&&isOverdue\(r,today\)/);
 assert.match(ui,/metric==='unassigned'&&!r\.assignee/);
 assert.match(ui,/metric==='today'&&executionDay\(r\)===today/);
});
test('calendar on left, real board, decisions, correspondence and role previews',()=>{
 assert.match(ui,/work-command-calendar/);
 assert.match(ui,/calendarDays\(anchor,'week'\)/);
 assert.match(ui,/work-command-board/);
 assert.match(ui,/work-command-responsibilities/);
 assert.match(ui,/WorkCorrespondenceStrip/);
 assert.match(ui,/section==='approvals'/);
 assert.match(ui,/section==='plans'/);
 assert.match(css,/grid-template-columns:minmax\(235px,285px\) minmax\(0,1fr\)/);
 assert.match(css,/max-width:520px/);
});
test('mail panel reads authorized existing internal tickets and never sends silently',()=>{
 assert.match(mail,/fetch\('\/api\/internal-tickets'/);
 assert.match(mail,/data\?\.tickets/);
 assert.match(mail,/\/work\/mail/);
 assert.doesNotMatch(mail,/method:'POST'/);
});
test('old APIs and task status/update details still reused',()=>{
 assert.match(work,/fetch\('\/api\/work'/);
 assert.match(work,/workTransition|status==='review'/);
 assert.match(work,/WorkCommandDashboard data=\{data\}/);
});
