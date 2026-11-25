import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const shell=read('components/workspace/workspace-shell.tsx');
const css=read('components/workspace/unified-shell-phase1.css');
const nav=read('lib/navigation.ts');
const toolbar=read('components/workspace/home-toolbar.tsx');
test('phase-one stylesheet is loaded after current route styles, existing components not rewritten',()=>{
 assert.match(shell,/import '\.\/workspace-repair\.css';\s*import '\.\/unified-shell-phase1\.css';/);
 assert.match(shell,/<HomeToolbar user=\{user\}\/>/);
 assert.match(shell,/<div className="unified-page">\{children\}<\/div>/);
 assert.match(shell,/<aside ref=\{sidebar\}/);
 assert.match(shell,/aria-expanded=\{mobile\}/);
});
test('all desktop routes use right-hand RTL sidebar including reference dashboard',()=>{
 assert.match(css,/right:0;left:auto/);
 assert.match(css,/margin-right:var\(--shell-sidebar-width\);margin-left:0/);
 assert.match(css,/reference-work-route #workspace-navigation\.unified-sidebar\{[\s\S]*?right:0!important;left:auto!important/);
 assert.match(css,/reference-work-route \.unified-shell\{[\s\S]*?margin-right:var\(--shell-sidebar-width\)!important/);
 assert.match(css,/@media\(max-width:790px\)/);
 assert.match(css,/transform:translateX\(105%\)!important/);
 assert.match(css,/visibility:hidden!important;pointer-events:none/);
});
test('actual header controls remain mounted and have expected green amber violet color selectors',()=>{
 for(const term of ['<WorkNotifications hideZero/>','/api/search?q=','/api/header/messages','<AccountMenu','<AssistantPanel'])assert.ok(toolbar.includes(term),term);
 for(const term of ['.mail-blue','.work-notifications>.icon-button','.ai-trigger','.home-search','.home-toolbar-profile'])assert.ok(css.includes(term),term);
});
test('four current work destinations remain, with no technical removal of any submenu',()=>{
 for(const path of ['/staff?view=plans','/staff?view=dashboard','/staff?view=approvals','/work/mail'])assert.ok(nav.includes(path),path);
 assert.match(shell,/navigationSections\(g\)/);
 assert.match(shell,/setOpen\(open===g\.id\?'':g\.id\)/);
 assert.doesNotMatch(css,/display:none[^}]*nav-group-links/);
});
