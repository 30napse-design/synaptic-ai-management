import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const policy=read('lib/science-policy.ts');
const screen=read('components/science/science-workspace.tsx');
const write=read('lib/science-write.ts');
const files=read('app/api/science/files/route.ts');
const route=read('app/(workspace)/work/[section]/page.tsx');
const css=read('components/science/science-four-desks.css');
test('four minimal consultation desk headings with existing nested tools',()=>{
 for(const label of ['پیش از اجرای پروژه','پس از برآورد و فاکتور','حین اجرای پژوهش','نتایج و مستندات'])assert.ok(policy.includes(label),label);
 assert.equal((policy.match(/\{id:'(before|estimate|execution|results)'/g)||[]).length,4);
 assert.match(screen,/sci-desk-grid/);
 assert.match(screen,/scienceConsultationDesks\.map/);
 assert.match(screen,/scienceTabs\)\.filter/);
 assert.doesNotMatch(screen,/className="sci-metrics"/);
});
test('manager assigns a real authorized member to each desk, creating idempotent linked work task',()=>{
 assert.match(screen,/action:'phase_assign'/);
 assert.match(screen,/data\.user\.manager\?<select/);
 assert.match(write,/if\(b\.action==='phase_assign'\)/);
 assert.match(write,/must\(u\.manager,/);
 assert.match(write,/scienceConsultationDeskIds\.includes/);
 assert.match(write,/scienceMembers\(\)/);
 assert.match(write,/taskId='science-phase:'/);
 assert.match(write,/INSERT OR IGNORE INTO staff_records/);
 assert.match(write,/entry\(c,u,'phase_assignment'/);
 assert.match(write,/phaseOwners:.*phase/);
 assert.match(route,/initialDesk=\{\(await searchParams\)\.desk\|\|'before'\}/);
});
test('scientific evidence provides actual authenticated upload, data classification and HTTPS links',()=>{
 for(const v of ["value:'raw'","value:'image'","value:'chart'","value:'protocol'"])assert.ok(screen.includes(v),v);
 assert.match(screen,/fetch\('\/api\/science\/files'/);
 assert.match(files,/bucket\(\)\.put/);
 assert.match(files,/scienceCase\(u,String\(form\.get\('case_id'/);
 assert.match(screen,/setModal\(\{title:'تکمیل ثبت سند بارگذاری‌شده'/);
 assert.match(screen,/action:'data_create'/);
 assert.match(screen,/text\('url','لینک HTTPS'/);
 assert.match(write,/if\(b\.action==='data_create'\|\|b\.action==='report_create'\)/);
});
test('right sidebar and responsive one-row four tiles are independently scoped',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(css,/\.unified-sidebar\s*\{/);
});
