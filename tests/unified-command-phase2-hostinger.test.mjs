import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const dash=read('components/workspace/work-command-dashboard.tsx');
const tickets=read('components/communication/internal-tickets.tsx');
const api=read('app/api/internal-tickets/route.ts');
const work=read('app/staff/work-app.tsx');
const staff=read('lib/staff-data.ts');
const shell=read('components/workspace/workspace-shell.tsx');
const nav=read('lib/navigation.ts');
const css=read('components/workspace/work-command-dashboard.css');
test('original ticket editor is embedded and protected by existing authorization',()=>{
 assert.match(dash,/import InternalTickets from '\.\.\/communication\/internal-tickets';/);
 assert.match(dash,/canAccessMail=manager\|\|hasAccess\(data.user,'mail'\)/);
 assert.match(dash,/section==='mail'&&canAccessMail/);
 assert.match(dash,/<InternalTickets\/>/);
 assert.match(tickets,/fetch\('\/api\/internal-tickets'/);
 assert.match(api,/await identity\(\)/);
 assert.match(api,/readInternalTickets\(u\)/);
 assert.match(api,/writeInternalTicket/);
});
test('tasks stay in original modal and show filtered loaded list',()=>{
 assert.match(dash,/onClick=\{\(\)=>open\(r\)\}/);
 assert.match(dash,/boardStatus\?statusRows\(boardStatus\):ranked\)\.map\(r=>/);
 assert.doesNotMatch(dash,/boardStatus\?statusRows\(boardStatus\):ranked\)\.slice\(0,8\)/);
 assert.match(work,/<WorkCommandDashboard data=\{data\}/);
});
test('server preserves actual user-scoped records, events and files',()=>{
 assert.match(staff,/visible\(r,u\)/);
 assert.match(staff,/canReadOperationWork\(u,r,/);
 assert.match(staff,/records:authorized/);
 assert.match(staff,/ids\.has\(e\.record_id\)/);
 assert.match(staff,/ids\.has\(f\.record_id\)/);
});
test('four navigation routes, same shell header and login are preserved',()=>{
 for(const link of ['/staff?view=dashboard','/staff?view=plans','/staff?view=approvals','/work/mail'])assert.ok(nav.includes(link),link);
 assert.match(shell,/<HomeToolbar user=\{user\}\/>/);
 assert.match(shell,/unified-shell-phase1\.css/);
 assert.match(css,/\.wrd-inline-mail/);
 assert.match(css,/@media\(max-width:760px\)/);
});
