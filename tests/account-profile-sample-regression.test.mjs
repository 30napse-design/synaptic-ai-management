import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const profile=readFileSync('app/account/profile-app.tsx','utf8');
const css=readFileSync('app/account/profile-app.css','utf8');
const menu=readFileSync('components/workspace/account-menu.tsx','utf8');
const avatar=readFileSync('app/api/profile/avatar/route.ts','utf8');
const intake=readFileSync('lib/researcher-sample-intake.ts','utf8');
const sample=readFileSync('components/laboratory/researcher-sample-intake.tsx','utf8');
test('account displays name with organizational English title, not raw permissions',()=>{
 assert.match(menu,/accountRoleEnglish\(user\)/);
 assert.match(profile,/accountRoleEnglish\(data\.user\)/);
 assert.doesNotMatch(profile,/نقش ثبت‌شده:|مجوزها:/);
 assert.match(profile,/profile-identity/);
});
test('clear file picker, private upload, success and failure messages',()=>{
 assert.match(profile,/type="file"/);
 assert.match(profile,/accept="image\/png,image\/jpeg/);
 assert.match(profile,/new FormData\(\)/);
 assert.match(profile,/if\(!response\.ok\)throw Error/);
 assert.match(profile,/synapse-profile-updated/);
 assert.match(avatar,/await identity\(\)/);
 assert.match(avatar,/env\.BUCKET/);
 assert.match(avatar,/max=2\*1024\*1024/);
});
test('responsive profile, recent authorized samples, original intake and custody still present',()=>{
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/@media\(max-width:570px\)/);
 assert.match(intake,/const overview=projects.flatMap/);
 assert.match(sample,/SampleIntakeRecords/);
 for(const action of ['intake_item','intake_shipment','intake_receive','intake_review'])assert.match(intake,new RegExp(action));
});
