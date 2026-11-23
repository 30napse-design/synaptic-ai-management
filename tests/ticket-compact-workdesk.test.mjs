import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const data=readFileSync('lib/operations-data.ts','utf8');
const dashboard=readFileSync('components/operations/ticket-dashboard.tsx','utf8');
const filters=readFileSync('components/operations/ticket-staff-filters.tsx','utf8');
const css=readFileSync('components/operations/ticket-dashboard.css','utf8');
const work=readFileSync('lib/operation-work-link.ts','utf8');
const assign=readFileSync('lib/operations-manual-assignment.ts','utf8');

test('six compact live cards are truly filterable and responsive',()=>{
 for(const id of ['all','new','today','waiting','overdue','unassigned'])assert.match(dashboard,new RegExp("id:'"+id+"'"));
 assert.match(dashboard,/aria-pressed=\{active===id\}/);
 assert.match(app,/setFollowup\(id==='today'/);
 assert.match(app,/setStatus\(id==='waiting'/);
 assert.match(css,/repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(css,/max-width:550px/);
});
test('live stats and status filters use existing authorized scope',()=>{
 assert.match(data,/ticketBaseWhere=where,ticketBaseArgs=\[\.\.\.args\]/);
 for(const v of ['all_count','today_count','new_count','waiting_count','overdue_count','unassigned_count'])assert.ok(data.includes(v),v);
 assert.match(data,/view==='tickets'\?100:50/);
 assert.match(app,/offset-\(tickets\?100:50\)/);
});
test('ticket staff desk is compact and inherited unrelated filters stay outside it',()=>{
 assert.match(app,/!tickets&&<section className="notice ops-view-guide"/);
 assert.match(app,/!tickets&&<details className="ops-help"/);
 assert.match(app,/!tickets&&<div className="desk-followups"/);
 assert.match(app,/ticket-bulk-trigger/);
 assert.match(app,/!tickets&&<EntryMetadata value=\{update\}/);
 for(const label of ['دسته اصلی','موضوع درخواست','مسئول تیکت'])assert.ok(filters.includes(label),label);
});
test('source filters are explicit and preserve legacy tickets',()=>{
 assert.match(filters,/Gmail و پیام‌های قبلی/);
 assert.match(filters,/تیکت‌های سایت/);
 assert.match(filters,/ثبت مستقیم سامانه/);
 assert.match(data,/ticketOrigin==='legacy'/);
 assert.match(data,/ticketOrigin==='site'/);
 assert.match(data,/ticketOrigin==='direct'/);
 assert.match(data,/ticketSQL/);
});
test('existing idempotent work projection and backend assignment guards remain',()=>{
 assert.match(work,/id='ops-work:'\+r\.id/);
 assert.match(work,/INSERT OR IGNORE INTO staff_records/);
 assert.match(work,/staff_work_notifications/);
 assert.match(assign,/validateManualAssignee/);
 assert.match(assign,/operationWorkStatements/);
});
