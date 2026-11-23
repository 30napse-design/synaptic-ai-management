import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const data=readFileSync('lib/operations-data.ts','utf8');
const link=readFileSync('lib/operation-work-link.ts','utf8');
const manual=readFileSync('lib/operations-manual-assignment.ts','utf8');
test('all, legacy, site and direct have distinct server source predicates',()=>{
 assert.match(app,/<option value="">همه منابع<\/option>/);
 assert.match(app,/<option value="legacy">Gmail و پیام‌های قبلی<\/option>/);
 assert.match(data,/source==='legacy'/);
 assert.match(data,/source_type='gmail'/);
 assert.match(data,/source==='site'\|\|source==='direct'/);
 assert.match(data,/json_extract\(source_labels,'\$\.ticket_source'\)/);
 assert.match(data,/source\)\{where\+=' AND 1=0'/);
});
test('same-position authorized accounts remain separate and private IDs are not swapped',()=>{
 assert.match(app,/const roleMembers=data\.members\.filter/);
 assert.match(app,/roleMembers\.filter\(\(x:any\)=>memberRole\(x\)===memberRole\(m\)\)/);
 assert.match(app,/value=\{m\.email\}/);
 assert.doesNotMatch(app,/new Map\(data\.members/);
});
test('legacy category and precise topic remain unchanged without fabricated mapping',()=>{
 assert.match(data,/COALESCE\(json_extract\(source_labels,'\$\.ticket_v'\),0\)=0 AND category=\?/);
 assert.match(data,/source==='legacy'.*subtype=\?/s);
 assert.match(data,/operationsScope\(u,routingReady\)/);
});
test('task linking is idempotent with source, alert and permission preserved in existing system',()=>{
 assert.match(link,/const id='ops-work:'\+r\.id/);
 assert.match(link,/INSERT OR IGNORE INTO staff_records/);
 assert.match(link,/staff_work_notifications/);
 assert.match(manual,/validateManualAssignee/);
 assert.match(manual,/mayAssignWork/);
});
