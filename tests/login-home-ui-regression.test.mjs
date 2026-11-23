import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const login=read('app/login/login-form.tsx');
const motion=read('app/login/synapse-login-motion.css');
const home=read('components/workspace/personal-home.tsx');
const homeCss=read('app/home.css');
const page=read('app/(workspace)/page.tsx');
const toolbar=read('components/workspace/home-toolbar.tsx');
test('login animation does not change credentials, submit API, return URL or management path',()=>{
 for(const token of ["fetch('/api/auth/login'","JSON.stringify({username,password,returnTo})","location.assign(d.next)","InitialOwnerSetup","signin-with-chatgpt","standalone","returnTo"])assert.ok(login.includes(token),token);
 assert.match(login,/synapse-entry-comet/);
 assert.match(login,/aria-hidden="true"/);
 assert.match(motion,/prefers-reduced-motion:reduce/);
 assert.match(motion,/synapse-card-reveal/);
 assert.match(motion,/animation:synapse-flyby 2s/);
 assert.doesNotMatch(login,/setTimeout|setInterval/);
});
test('home remains a role-scoped projection of actual dashboard and notifications',()=>{
 assert.match(page,/readHomeData\(u\)/);
 assert.match(home,/d.dashboard/);
 assert.match(home,/importantNotification/);
 assert.match(home,/priorities.map/);
 assert.match(home,/nextPlan/);
 assert.match(home,/workspacePreviews\(u\)/);
 assert.match(home,/hasAccess\(u,'sample_intake'\)/);
 assert.match(home,/hasAccess\(u,'projects'\)/);
 assert.match(home,/u.name\|\|'همکار پژوهشکده'/);
 assert.doesNotMatch(home,/mountain-sunrise\.png/);
});
test('existing home toolbar retains real search, messages, notifications and account menu',()=>{
 for(const text of ["'/api/search?q='","'/api/header/messages'","WorkNotifications","AccountMenu","AssistantPanel"])assert.ok(toolbar.includes(text),text);
 assert.match(homeCss,/home-v2-neural/);
 assert.match(homeCss,/@media\(max-width:700px\)/);
});
