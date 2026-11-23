import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const dashboard=read('components/workspace/work-command-dashboard.tsx');
const tickets=read('components/communication/internal-tickets.tsx');
const work=read('app/staff/work-app.tsx');
const nav=read('lib/navigation.ts');
const css=read('components/workspace/work-command-dashboard.css');
test('work command center embeds the original operational internal ticket editor, not a link-only placeholder',()=>{
 assert.match(dashboard,/import InternalTickets from '\.\.\/communication\/internal-tickets';/);
 assert.match(dashboard,/section==='mail'&&canAccessMail&&<section/);
 assert.match(dashboard,/<InternalTickets\/>/);
 assert.match(tickets,/fetch\('\/api\/internal-tickets'/);
 assert.match(tickets,/action:kind/);
 assert.doesNotMatch(dashboard,/مشاهده دریافتی‌ها، ارسالی‌ها و سابقه گفتگوها/);
});
test('internal mail access uses existing permission policy; original route remains for fallback',()=>{
 assert.match(dashboard,/const canAccessMail=manager\|\|hasAccess\(data.user,'mail'\)/);
 assert.match(dashboard,/id:'mail' as const/);
 assert.match(dashboard,/<Link href="\/work\/mail">نمای مستقل مکاتبات/);
});
test('task views remain functional and display every loaded filtered item rather than first eight',()=>{
 assert.match(dashboard,/setSection\(id\)/);
 assert.match(dashboard,/onClick=\{\(\)=>open\(r\)\}/);
 assert.match(dashboard,/boardStatus\?statusRows\(boardStatus\):ranked\)\.map\(r=>/);
 assert.doesNotMatch(dashboard,/boardStatus\?statusRows\(boardStatus\):ranked\)\.slice\(0,8\)/);
 for(const label of ['کارتابل وظایف','برنامه‌ریزی','بررسی و تأیید','مکاتبات داخلی'])assert.ok(dashboard.includes(label),label);
});
test('four original sidebar destinations and standalone work editor remain unchanged',()=>{
 for(const href of ['/staff?view=plans','/staff?view=dashboard','/staff?view=approvals','/work/mail'])assert.ok(nav.includes(href),href);
 assert.match(work,/<WorkCommandDashboard data=\{data\}/);
});
test('inline editor CSS respects mobile controls',()=>{
 assert.match(css,/\.wrd-inline-mail/);
 assert.match(css,/@media\(max-width:760px\)/);
});
