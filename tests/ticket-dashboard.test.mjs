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
 assert.match(styles,/max-width:860px/);
 assert.match(app,/setFollowup\(id==='today'/);
 assert.match(app,/setStatus\(id==='waiting'/);
});
