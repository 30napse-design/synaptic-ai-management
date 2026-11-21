import test from 'node:test';
import assert from 'node:assert/strict';
import {legacy} from '../lib/legacy.ts';
import {legacyWorkspaceScript} from '../lib/legacy-workspace.ts';

// A DOM contract fixture, not a browser or visual acceptance test.
function mount(email,owner,store=new Map()){
 const nodes=new Map(),listeners=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',classList:{remove(){},add(){},toggle(){}},insertAdjacentHTML(where,text){this.innerHTML+=text},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false},reset(){}});return nodes.get(id)};
 const container={querySelector:node,querySelectorAll:()=>[],addEventListener:(event,fn)=>listeners.set(event,fn)};
 const storage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
 const script=legacyWorkspaceScript(legacy['app.js'],email,owner);
 new Function('container','initialView','localStorage','window','location','setTimeout',script)(container,'chats',storage,{scrollTo(){throw Error('Unexpected scroll jump')},addEventListener(){throw Error('Unscoped hash listener')}},{hash:'#finance'},()=>{});
 return {node,listeners,store};
}
test('add chat opens the scoped dialog, validates and saves without navigating or scrolling',()=>{
 const app=mount('staff:it',false);
 app.listeners.get('click')({target:{closest:selector=>selector==='[data-add-chat]'?{}:null}});
 assert.equal(app.node('#chatDialog').open,true);
 app.node('#chatUrl').value='https://chatgpt.com/c/synthetic-chat';
 app.node('#chatTitle').value='Synthetic project discussion';app.node('#chatSection').value='projects';
 app.node('#chatForm').onsubmit({preventDefault(){}});
 const saved=JSON.parse(app.store.get('synapse-chats-v1:staff%3Ait'));
 assert.equal(saved.length,1);assert.equal(saved[0].section,'projects');assert.equal(app.node('#chatDialog').open,false);
 assert.ok(mount('staff:it',false,app.store).node('#main').innerHTML.includes('Synthetic project discussion'));
 assert.ok(!mount('staff:admin',false,app.store).node('#main').innerHTML.includes('Synthetic project discussion'));
 app.node('#chatForm').onsubmit({preventDefault(){}});assert.ok(app.node('#formError').textContent.includes('قبلاً'));
});
test('owner can recover historical browser shortcuts without exposing them to another account',()=>{
 const store=new Map([['synapse-chats-v1',JSON.stringify([{id:'old',title:'Historical shortcut',url:'https://chatgpt.com/c/historical',section:'home'}])]]);
 assert.ok(mount('owner@example.invalid',true,store).node('#main').innerHTML.includes('Historical shortcut'));
 assert.ok(!mount('staff:manager',false,store).node('#main').innerHTML.includes('Historical shortcut'));
 assert.ok(store.has('synapse-chats-v1'),'Historical storage remains untouched');
});
