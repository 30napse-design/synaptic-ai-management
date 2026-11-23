import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('lib/operations-data.ts','utf8');
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const cards=readFileSync('components/operations/ticket-dashboard.tsx','utf8');
const styles=readFileSync('components/operations/ticket-dashboard.css','utf8');

test('Ticket desk loads 100 real recent rows, other operations retain page size 50',()=>{
 assert.match(source,/view==='tickets'\?100:50/);
 assert.match(source,/LIMIT '\+initialPageSize\+' OFFSET/);
 assert.match(source,/nextOffset:offset\+initialPageSize<total/);
 assert.match(source,/ORDER BY COALESCE/);
});
test('Dashboard counts are server-derived, not hard-coded or based on current page only',()=>{
 assert.match(source,/COUNT\(\*\) AS all_count/);
 assert.match(source,/AS today_count/);
 assert.match(source,/AS new_count/);
 assert.match(source,/AS waiting_count/);
 assert.match(source,/ticketBaseWhere/);
 assert.match(app,/total=\{Number\(data\.ticketSummary\?\.all/);
 assert.match(app,/today=\{Number\(data\.ticketSummary\?\.today/);
});
test('Colored cards have interactive filters, keyboard accessibility and mobile breakpoints',()=>{
 assert.match(cards,/aria-pressed=\{active===id\}/);
 assert.match(cards,/onClick=\{\(\)=>onSelect\(id\)\}/);
 assert.match(styles,/ticket-card-all/);
 assert.match(styles,/ticket-card-today/);
 assert.match(styles,/ticket-card-waiting/);
 assert.match(styles,/ticket-card-new/);
 assert.match(styles,/max-width:660px/);
 assert.match(styles,/repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(styles,/ticket-card-overdue/);
 assert.match(styles,/ticket-card-unassigned/);
 assert.match(app,/setFollowup\(\['today','overdue','unassigned'\]/);
 assert.match(app,/setStatus\(id==='waiting'/);
});

test('Existing scoped operations queries and ticket source selectors remain in place',()=>{
 assert.match(source,/operationsScope\(u,routingReady\)/);
 assert.match(source,/ticketBaseWhere=where,ticketBaseArgs=\[\.\.\.args\]/);
 assert.match(source,/view==='tickets'\&\&p\.get\('status'\)/);
 assert.match(source,/view==='tickets'\?6:5/);
 assert.match(source,/json_extract\(source_labels,'\$\.ticket_source'\)/);
 assert.match(source,/COALESCE\(json_extract\(source_labels,'\$\.ticket_v'\),0\)=0/);
 assert.match(app,/ticketSourceFilter/);
 assert.match(app,/ticketCategoryFilter/);
 assert.match(app,/ticketTopicFilter/);
 assert.match(app,/aria-label="مسئول تیکت"/);
});
test('No artificial ticket population or migration is performed by the dashboard',()=>{
 assert.doesNotMatch(source,/INSERT INTO ops_items|UPDATE ops_items|DELETE FROM ops_items/i);
 assert.match(source,/status!='closed' AND due=\?/);
 assert.match(source,/SUM\(CASE WHEN status='waiting'/);
 assert.match(source,/SUM\(CASE WHEN status='open'/);
 assert.match(app,/const pageSize=tickets\?100:50/);
 assert.match(app,/offset-pageSize/);
 assert.match(app,/Math\.floor\(offset\/pageSize\)\+1/);
});

test('Extra KPI counts use scoped server SQL and no guessed ticket status',()=>{
 assert.match(source,/AS overdue_count/);
 assert.match(source,/AS unassigned_count/);
 assert.match(source,/status!='closed' AND due!='' AND due<\?/);
 assert.match(source,/ticketBaseWhere/);
 assert.match(app,/data\.ticketSummary\?\.overdue/);
 assert.match(app,/data\.ticketSummary\?\.unassigned/);
});
test('Staff UI hides channel grid and provides compact source selection',()=>{
 assert.match(app,/!tickets&&source!=='incoming'/);
 assert.match(app,/aria-label="منبع تیکت"/);
 assert.match(app,/value="gmail"/);
 assert.match(source,/source_type='gmail'/);
 assert.match(app,/roleMembers/);
 assert.match(app,/organizationalCode/);
 assert.match(app,/ticket-bulk-panel/);
 assert.match(app,/ticket-detail-modal/);
});
test('No duplicate links or unauthorized assignment shortcuts introduced',()=>{
 const link=readFileSync('lib/operation-work-link.ts','utf8');
 const assign=readFileSync('lib/operations-manual-assignment.ts','utf8');
 assert.match(link,/ops-work:'\+r.id/);
 assert.match(link,/INSERT OR IGNORE INTO staff_records/);
 assert.match(assign,/validateManualAssignee/);
 assert.match(assign,/r.revision===x.revision/);
 assert.match(assign,/canSeeOps/);
});
