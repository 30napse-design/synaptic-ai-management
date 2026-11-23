import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {workspaceNavigation,activeNavigation,navigationSections,routeRegistry,resolveWorkspaceRoute,workspacePreviews} from '../lib/navigation.ts';
const owner={email:'ekramiihamid@gmail.com',manager:true,permissions:[]};
test('six approved domains preserve laboratory cases and all eight finance destinations',()=>{
 const groups=workspaceNavigation(owner);
 assert.deepEqual(groups.map(g=>g.id),['operations','work','research','laboratories','finance','management']);
 const research=groups.find(g=>g.id==='research');
 assert.equal(research.label,'مشاوره علمی و مدیریت پروژه‌ها');
 assert.deepEqual(research.items.map(i=>i.label),['ثبت پرونده و مدیریت پروژه','مرکز مشاوره علمی','مشتریان']);
 assert.deepEqual(research.items.map(i=>i.href),['/laboratories','/work/science','/operations?view=history']);
 assert.ok(groups.find(g=>g.id==='work').items.some(i=>i.label==='مکاتبات داخلی'&&i.href==='/work/mail'));
 assert.ok(!groups.some(g=>g.items.some(i=>i.href==='/laboratories?view=new')));
 assert.ok(!research.items.some(i=>i.href==='/work/projects'||i.href==='/work/mail'));
 assert.equal(groups.find(g=>g.id==='finance').items.length,8);
 assert.deepEqual(navigationSections(groups.find(g=>g.id==='finance')).map(s=>s.id),['documents','payments','accounting']);
 const links=routeRegistry(owner);assert.equal(new Set(links.map(i=>i.href)).size,links.length);
 for(const link of links){const path=new URL(link.href,'https://synapse.test').pathname;
 const direct='app/(workspace)'+path+'/page.tsx';
 assert.ok(existsSync(direct)||/^\/(finance|work|manage)\/[^/]+$/.test(path),link.href);
 assert.ok(link.label&&link.description&&link.destination&&link.access);
 }
});
test('active route resolves calls, dispatch, work views, laboratory domains and aliases exactly',()=>{
 assert.equal(activeNavigation('/operations',new URLSearchParams('source=incoming'),'/operations'),false);
 for(const [path,query,title]of [['/operations','source=incoming','دفتر تماس‌های ورودی'],['/operations','view=dispatch','مدیریت و پیگیری درخواست‌ها'],['/staff','','برنامه‌ریزی'],['/staff','view=cases','پرونده‌های ارجاع‌شده'],['/laboratories','','ثبت پرونده و مدیریت پروژه'],['/work/finance','','داشبورد مالی'],['/manage/finance','resources=1','منابع و سوابق مالی']])assert.equal(resolveWorkspaceRoute(path,new URLSearchParams(query),owner).label,title);
 assert.equal(activeNavigation('/staff',new URLSearchParams('view=board'),'/staff?view=plans'),false);
});
test('home previews expose only existing enabled destinations without granting API access',()=>{
 const user={email:'staff:test',permissions:['people'],dataPermissions:[]};const registry=routeRegistry(user);
 for(const href of ['/manage/chats','/accounts','/manage/connections','/finance/bank'])assert.equal(registry.find(r=>r.href===href).enabled,false);
 assert.ok(workspacePreviews(user).every(p=>p.links.every(l=>l.enabled)));
 assert.equal(workspacePreviews(owner).length,6);
});
test('laboratory navigation preserves restricted operational API boundary and canonical specialty links',()=>{
 const lab=workspaceNavigation({laboratory:true,laboratoryType:'internal',permissions:[]});
 assert.ok(lab.find(g=>g.id==='research').items.some(i=>i.href==='/laboratories'));
 assert.ok(lab.find(g=>g.id==='laboratories').items.every(i=>i.href.startsWith('/laboratories?domain=')));
});

test('legacy new-case and project destinations remain implemented despite removed sidebar shortcuts',()=>{
 assert.ok(existsSync('app/(workspace)/laboratories/page.tsx'));
 assert.ok(existsSync('app/(workspace)/work/[section]/page.tsx'));
 const nav=workspaceNavigation(owner);
 assert.ok(nav.find(g=>g.id==='operations').items.some(i=>i.href==='/sample-intake'));
 assert.ok(nav.find(g=>g.id==='work').items.some(i=>i.href==='/work/mail'));
});

test('acceptance and communications sidebar keeps exactly four approved entries for all user types',()=>{
 const approved=[
  ['پذیرش، ارتباط و پشتیبانی','/operations'],
  ['دفتر تماس‌های ورودی','/operations?source=incoming'],
  ['پذیرش نمونه محققین','/sample-intake'],
  ['تیکت و پشتیبانی','/operations?view=tickets'],
 ];
 for(const user of [owner,{laboratory:true,laboratoryType:'internal',permissions:[]},{email:'staff:test',permissions:['calls'],dataPermissions:[]}]){
  const group=workspaceNavigation(user).find(g=>g.id==='operations');
  assert.equal(group.label,'پذیرش و ارتباطات');
  assert.deepEqual(group.items.map(i=>[i.label,i.href]),approved);
  assert.ok(!group.items.some(i=>i.href.includes('direction=outbound')||i.href.includes('direction=visit')));
 }
});
test('legacy outbound and visit URLs remain routable independently of sidebar links',()=>{
 assert.ok(existsSync('app/(workspace)/operations/page.tsx'));
 for(const query of ['direction=outbound','direction=visit']){
  const route=resolveWorkspaceRoute('/operations',new URLSearchParams(query),owner);
  assert.ok(route&&route.group==='operations');
 }
 assert.equal(resolveWorkspaceRoute('/operations',new URLSearchParams('source=incoming'),owner).label,'دفتر تماس‌های ورودی');
 assert.equal(resolveWorkspaceRoute('/operations',new URLSearchParams('view=tickets'),owner).label,'تیکت و پشتیبانی');
});
