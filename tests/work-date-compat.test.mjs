import test from 'node:test';
import assert from 'node:assert/strict';
import {workDayKey,workSummary} from '../lib/work-policy.ts';
import {dailyMessage} from '../lib/home-policy.ts';
test('legacy completion dates cannot crash home or fabricate completion today',()=>{const user={email:'a',permissions:[]};const rows=[{id:'missing',kind:'task',assignee:'a',status:'done',updated_at:''},{id:'invalid',kind:'task',assignee:'a',status:'done',completedAt:'invalid',updated_at:'invalid'},{id:'fallback',kind:'task',assignee:'a',status:'done',completedAt:'invalid',updated_at:'2026-11-11T09:00:00Z'}];assert.deepEqual(workSummary(rows,user,'2026-11-11').completed.map(r=>r.id),['fallback']);assert.equal(workDayKey('invalid'),'');assert.equal(workDayKey(null),'');assert.equal(workDayKey('2026-11-10T20:00:00Z'),'2026-11-11');assert.equal(dailyMessage(new Date('invalid')).length,2)});
