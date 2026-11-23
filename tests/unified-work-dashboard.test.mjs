import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const nav=readFileSync('lib/navigation.ts','utf8');
const ui=readFileSync('components/workspace/work-command-dashboard.tsx','utf8');
const css=readFileSync('components/workspace/work-command-dashboard.css','utf8');
const work=readFileSync('app/staff/work-app.tsx','utf8');
const data=readFileSync('lib/staff-data.ts','utf8');
const mail=readFileSync('components/workspace/work-correspondence-strip.tsx','utf8');
const shell=readFileSync('components/workspace/workspace-shell.tsx','utf8');
const repair=readFileSync('components/workspace/workspace-repair.css','utf8');
test('sidebar offers four approved destinations and legacy work routes remain',()=>{
 const group=nav.match(/\{id:'work',label:'کارتابل و برنامه‌ریزی',items:\[([^\]]+)\]\}/)?.[1]||'';
 assert.equal((group.match(/item\(/g)||[]).length,4);
 for(const label of ['برنامه‌ریزی','کارتابل وظایف','بررسی و تأیید','مکاتبات داخلی'])assert.ok(group.includes(label));
 assert.match(work,/overview:'امروز من'/);
 assert.match(work,/board:'برد وظایف'/);
 assert.match(work,/view==='dashboard'\?<WorkCommandDashboard/);
});
test('all data is sourced from authorized real staff records, with no example counters',()=>{
 assert.match(ui,/data\.records\|\|\[\]/);
 assert.match(ui,/filter\(isWork\)/);
 assert.match(ui,/participant\(r,data\.user\)/);
 assert.match(ui,/\.slice\(0,50\)/);
 assert.match(data,/const authorized=records\.filter/);
 assert.doesNotMatch(ui,/Math\.random\(|1048|۱۰۴۸/);
});
test('six clickable scoped status metrics and board columns',()=>{
 for(const id of ['all','new','today','waiting','overdue','unassigned'])assert.match(ui,new RegExp("id:'"+id+"'"));
 assert.match(ui,/setMetric\(id\)/);
 assert.match(ui,/isOverdue\(r,today\)/);
 for(const status of ['todo','doing','blocked','done'])assert.match(ui,new RegExp("id:'"+status+"'"));
 assert.match(ui,/onClick=\{\(\)=>open\(r\)\}/);
});
test('Persian 7-column MONTH calendar with dynamic month navigation and day records',()=>{
 assert.match(ui,/calendarDays\(anchor,'month'\)/);
 assert.match(ui,/fa-IR-u-ca-persian/);
 assert.match(ui,/wrd-calendar-grid/);
 assert.match(ui,/moveDay\(first,-1\)/);
 assert.match(ui,/moveDay\(last,1\)/);
 assert.match(ui,/executionDay\(r\)===anchor/);
 assert.match(css,/grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
});
test('reference positions: header and sidebar, cards, left month, dense board, bottom fullwidth table',()=>{
 assert.match(shell,/reference-work-route/);
 assert.match(shell,/پژوهشکده سلول و بافت هوشمند/);
 assert.ok(existsSync('public/brand/synapse-neural-header.svg'));
 assert.match(repair,/synapse-neural-header\.svg/);
 for(const key of ['wrd-title','wrd-module-row','wrd-metrics','wrd-calendar-panel','wrd-board','wrd-columns'])assert.ok(css.includes('.'+key),key);
 assert.match(css,/grid-template-columns:minmax\(255px,305px\) minmax\(0,1fr\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(css,/max-width:460px/);
});
test('communications table merges actual permitted task links and internal API, never sends a message',()=>{
 assert.match(mail,/fetch\('\/api\/internal-tickets'/);
 assert.match(mail,/records\.filter\(r=>r\.manualOperationId\)/);
 for(const label of ['کد','عنوان','منبع','واحد مرتبط','مسئول','وضعیت','تاریخ'])assert.ok(mail.includes(label),label);
 assert.doesNotMatch(mail,/method:'POST'|Math\.random/);
});
test('old editor, status transitions and file history are still present',()=>{
 assert.match(work,/fetch\('\/api\/work'/);
 assert.match(work,/workTransition|status==='review'/);
 assert.match(work,/WorkCommandDashboard data=\{data\}/);
});
