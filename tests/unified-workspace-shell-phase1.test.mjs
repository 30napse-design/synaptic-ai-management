import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const shell=read('components/workspace/workspace-shell.tsx');
const css=read('components/workspace/unified-shell-phase1.css');
const nav=read('lib/navigation.ts');
const toolbar=read('components/workspace/home-toolbar.tsx');
test('common RTL shell CSS loaded after old styles with original children',()=>{
 assert.match(shell,/import '\.\/synapse-experience\.css';\s*import '\.\/unified-shell-phase1\.css';/);
 assert.match(shell,/<HomeToolbar user=\{user\}\/>/);
 assert.match(shell,/<div className="unified-page">\{children\}<\/div>/);
});
test('right sidebar position and exact mobile breakpoint are set without remounting navigation',()=>{
 assert.match(css,/right:0;left:auto/);
 assert.match(css,/margin-right:var\(--shell-sidebar-width\);margin-left:0/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/#workspace-navigation:not\(\.open\)/);
 assert.match(css,/#workspace-navigation\.open/);
 assert.match(shell,/<aside ref=\{sidebar\}/);
 assert.match(shell,/aria-expanded=\{open===g.id\}/);
});
test('shared top bar retains real search, notifications, email, AI, profile',()=>{
 for(const s of ['<WorkNotifications hideZero/>','/api/search?q=','/api/header/messages','<AccountMenu','<AssistantPanel'])assert.ok(toolbar.includes(s),s);
 for(const s of ['.mail-blue','.work-notifications>.icon-button','.ai-trigger','.home-search','.home-toolbar-profile'])assert.ok(css.includes(s),s);
});
test('four functional work destinations remain visible and untouched in phase one',()=>{
 for(const path of ['/staff?view=plans','/staff?view=dashboard','/staff?view=approvals','/work/mail'])assert.ok(nav.includes(path),path);
 assert.doesNotMatch(css,/display:none[^}]*nav-group-links/);
});
