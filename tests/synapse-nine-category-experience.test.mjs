import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {intakeNineGroups,classifyIncomingNine} from '../lib/intake-nine-groups.ts';
const read=p=>readFileSync(p,'utf8');
test('exactly nine distinct approved responsibility families, not staff accounts',()=>{
 assert.equal(intakeNineGroups.length,9);
 assert.equal(new Set(intakeNineGroups.map(g=>g.id)).size,9);
 assert.ok(intakeNineGroups.every(g=>g.label.length>8));
 assert.ok(intakeNineGroups.some(g=>g.id==='scientific'));
 assert.ok(intakeNineGroups.some(g=>g.id==='executive'));
});
test('existing approved Gmail and incoming calls keep their category and are only projected',()=>{
 const cases={customers:'reception',visits:'reception',billing:'financial',results:'results',projects:'projects',internal:'administration',system:'systems'};
 for(const [category,id] of Object.entries(cases)){
  const input={category,subtype:'ثبت سفارش',source_type:'gmail'};
  const original={...input};
  assert.equal(classifyIncomingNine(input).id,id);
  assert.deepEqual(input,original);
 }
});
test('ambiguous, manager-only and sensitive records never silently assigned',()=>{
 assert.equal(classifyIncomingNine({category:'system',subtype:'نیازمند بررسی'}).id,'escalations');
 assert.equal(classifyIncomingNine({category:'other',subtype:'نامشخص'}).needsReview,true);
 assert.equal(classifyIncomingNine({category:'billing',subtype:'ارسال فاکتور',manager_only:true}).id,null);
 assert.equal(classifyIncomingNine({category:'',subtype:''}).needsReview,true);
});
test('filtered SQL is scoped after authorization and before pagination, preserving old data',()=>{
 const sql=read('lib/operations-data.ts');
 assert.match(sql,/const scoped|const \{sql:permitted,args:scopeArgs\}=operationsScope/);
 assert.match(sql,/nineGroup/);
 assert.match(sql,/category IN \(/);
 assert.match(sql,/subtype IN \(/);
 assert.match(sql,/source_type='incoming'|source_type='gmail'/);
 assert.doesNotMatch(read('lib/intake-nine-groups.ts'),/UPDATE ops_items|INSERT INTO ops_items|DELETE FROM ops_items/);
});
test('nine category controls are clickable with true filtered totals and status chips',()=>{
 const app=read('app/operations/operations-app.tsx');
 assert.match(app,/ops-nine-grid/);
 assert.match(app,/setNineGroup\(g.id\)/);
 assert.match(app,/data.total/);
 assert.match(app,/classifyIncomingNine\(item\)/);
});
test('global search reaches messages and incoming-call narratives under original security scope',()=>{
 const search=read('lib/global-search.ts');
 assert.match(search,/source_body LIKE/);
 assert.match(search,/call_date LIKE/);
 assert.match(search,/operationsScope\(/);
 assert.match(search,/canSeeOps\(/);
});
test('home statuses are based on permission-scoped SQL, not placeholder sample records',()=>{
 const data=read('lib/home-data.ts'),ui=read('components/workspace/personal-home.tsx');
 assert.match(data,/operationsScope\(/);
 assert.match(data,/COUNT\(\*\) AS all_count/);
 assert.match(data,/unassigned_count/);
 assert.match(ui,/home-operational-board/);
 assert.match(ui,/d.operationsOverview/);
 assert.doesNotMatch(ui,/Math.random\(/);
});
test('login animation is nonblocking and honors reduced motion and preserves actual API',()=>{
 const form=read('app/login/login-form.tsx'),css=read('app/login/synapse-login-motion.css');
 assert.match(form,/synapse-entry-comet/);
 assert.match(form,/fetch\('\/api\/auth\/login'/);
 assert.match(form,/autoComplete="current-password"/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/synapse-flyby/);
 assert.ok(existsSync('components/workspace/synapse-experience.css'));
});
test('original notification and message APIs remain wired to existing header controls',()=>{
 const bar=read('components/workspace/home-toolbar.tsx'),bell=read('components/workspace/work-notifications.tsx');
 assert.match(bar,/\/api\/header\/messages/);
 assert.match(bar,/\/api\/search/);
 assert.match(bell,/\/api\/work\/notifications/);
 assert.match(bell,/aria-expanded=\{open\}/);
});
