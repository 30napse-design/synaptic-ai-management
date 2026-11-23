import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const shell=readFileSync('components/workspace/workspace-shell.tsx','utf8');
const css=readFileSync('components/workspace/workspace-repair.css','utf8');
test('sidebar groups start collapsed, including work and planning',()=>{
 assert.match(shell,/\[open,setOpen\]=useState\(''\)/);
 assert.match(shell,/\[subOpen,setSubOpen\]=useState\(''\)/);
 assert.doesNotMatch(shell,/setOpen\(activeGroup\)/);
});
test('the dashboard home label is consistent',()=>{
 assert.match(shell,/داشبورد اصلی/);
 assert.doesNotMatch(shell,/خانه سامانه/);
});
test('duplicate account actions removed from sidebar but header toolbar stays',()=>{
 assert.doesNotMatch(shell,/className="unified-account"/);
 assert.match(shell,/<HomeToolbar user=\{user\}\/>/);
});
test('sidebar has a single scrolling navigation region and consistent dark palette',()=>{
 assert.match(css,/#workspace-navigation\.unified-sidebar\{[^}]*overflow:hidden/);
 assert.match(css,/#workspace-navigation>nav\{[^}]*overflow-x:hidden;overflow-y:auto/);
 assert.match(css,/background:linear-gradient\(165deg,#203c61/);
});
