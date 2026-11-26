import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const component=readFileSync('components/operations/ticket-dashboard.tsx','utf8');
const style=readFileSync('components/operations/ticket-dashboard.css','utf8');
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const query=readFileSync('lib/operations-data.ts','utf8');
const link=readFileSync('lib/operation-work-link.ts','utf8');
const assignment=readFileSync('lib/operations-manual-assignment.ts','utf8');
test('six distinct compact status controls use server-fed values',()=>{
 for(const id of ['all','new','today','waiting','overdue','unassigned'])assert.match(component,new RegExp("id:'"+id+"'"));
 assert.match(style,/repeat\(6,minmax\(0,1fr\)\)/);
 for(const field of ['total','newCount','today','waiting','overdue','unassigned'])assert.ok(app.includes(field+'={Number(data.ticketSummary'));
});
test('scoped counts and status filters never mutate original tickets',()=>{
 assert.match(query,/operationsScope\(u,routingReady\)/);
 assert.match(query,/COUNT\(\*\) AS all_count/);
 assert.match(query,/AS overdue_count/);
 assert.match(query,/AS unassigned_count/);
 assert.match(query,/status!='closed' AND due!='' AND due<\?/);
 assert.match(query,/view==='tickets'\?\(p\.get\('pageSize'\)==='10'\?10:p\.get\('pageSize'\)==='5'\?5:100\):50/);
 assert.doesNotMatch(query,/INSERT INTO ops_items|DELETE FROM ops_items/);
});
test('staff desk omits noisy channel selector, retains categories, roles and history',()=>{
 assert.match(app,/!tickets&&source!=='incoming'/);
 // TKT five-filter desk: the ticket source selector now lives in ResponsibilityArea and is fed by the desk's own source state.
 assert.match(app,/source=\{ticketSourceFilter\}/);
 assert.match(readFileSync('components/operations/ticket-v3-controls.tsx','utf8'),/ticketSourceOptions\.map/);
 assert.match(app,/getTicketCategories/);
 assert.match(app,/setTicketTopicFilter\(''\)/);
 assert.match(app,/owner=\{unifiedRole\}/);
 assert.match(readFileSync('components/operations/unified-intake-filters.tsx','utf8'),/intakeResponsibleRoles\.map/);
 assert.match(app,/ticket-bulk-panel/);
 assert.match(app,/ticket-detail-modal/);
 assert.match(app,/selected\.attachments/);
 assert.match(app,/selected\.sourceBody/);
 assert.match(app,/selected\.sourceUrl/);
});
test('manual assignment projects to stable one-to-one task id with access checks',()=>{
 assert.match(link,/const id='ops-work:'\+r.id/);
 assert.match(link,/INSERT OR IGNORE INTO staff_records/);
 assert.match(link,/manualOperationId:r.id/);
 assert.match(link,/staff_work_notifications/);
 assert.match(assignment,/validateManualAssignee/);
 assert.match(assignment,/mayAssignWork/);
 assert.match(assignment,/canUseOpsCategory/);
 assert.match(assignment,/operationWorkStatements\(/);
});
