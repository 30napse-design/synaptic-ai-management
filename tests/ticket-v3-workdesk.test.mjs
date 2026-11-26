import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const controls=readFileSync('components/operations/ticket-v3-controls.tsx','utf8');
const css=readFileSync('components/operations/ticket-dashboard.css','utf8');
const db=readFileSync('lib/operations-data.ts','utf8');
test('V3 uses existing authorized data endpoint and preserves detail and assignment',()=>{
 assert.match(app,/fetch\('\/api\/operations\?'/);
 assert.match(app,/data\.items\.map/);
 assert.match(app,/onClick=\{\(\)=>open\(item\)\}/);
 assert.match(app,/manual_assign/);
 assert.doesNotMatch(controls,/mockTickets|activeDays/);
 assert.match(db,/operationsScope\(u,routingReady\)/);
});
test('role counts exclude only the role predicate; page sizes are server bounded',()=>{
 assert.match(db,/roleFacetSeed\+where\.slice\(roleFacetPrefix\.length\)/);
 assert.match(db,/roleFacetSeedArgs,\.\.\.args\.slice\(roleFacetPrefixArgs\.length\)/);
 assert.match(app,/pageSize:tickets\?String\(ticketPageSize\)/);
 assert.match(app,/useState\(5\)/);
 assert.match(app,/counts=\{data\.roleCounts/);
});
test('V3 layout, real calendar and isolated creation dialog',()=>{
 assert.match(controls,/en-u-ca-persian/);
 assert.match(controls,/Asia\/Tehran/);
 assert.match(controls,/onDay\(d\)/);
 assert.match(css,/grid-template-columns:minmax\(210px,24%\)/);
 assert.ok(app.indexOf('<ResponsibilityArea')<app.indexOf('v3-list-heading'));
 assert.match(app,/tickets\?setModal\('ticket-create'\)/);
 assert.doesNotMatch(app,/<TicketSupportCreate inline/);
});
