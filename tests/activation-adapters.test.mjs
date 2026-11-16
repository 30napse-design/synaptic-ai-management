import assert from 'node:assert/strict';
import {legacyCallEvents} from '../lib/call-sheet-adapter.ts';
import {workspaceNavigation} from '../lib/navigation.ts';
const headers=['ردیف','نام','شماره فاکتور','شماره تماس','ایمیل','عنوان','توضیحات تماس گیرنده'];
const values=[headers,['1405/08/24'],['1','Synthetic old','','09000000001','','ثبت سفارش','Old'],['۱۴۰۵/۰۸/۲۵ دوشنبه'],['1','Synthetic current','','۰۹۰۰۰۰۰۰۰۰۲','','ثبت سفارش','Current'],['19'],['2','Synthetic ambiguous','','09000000003','','ثبت سفارش','Ambiguous']];
const result=legacyCallEvents(values,'2026-11-16');assert.equal(result.events.length,1);assert.equal(result.events[0].at,'2026-11-16T00:00:00Z');assert.equal(result.events[0].phone,'09000000002');assert.equal(result.skipped.outsideWindow,1);assert.equal(result.skipped.undated,1);assert.throws(()=>legacyCallEvents([['invalid']], '2026-11-16'));
for(const u of [{email:'test',permissions:['people']},{laboratory:true,laboratoryType:'internal'}]){const groups=workspaceNavigation(u),matches=groups.flatMap(g=>g.items.filter(x=>x.href==='/operations?view=dispatch').map(i=>({group:g.id,...i})));assert.equal(matches.length,1);assert.equal(matches[0].group,'management');assert.equal(matches[0].enabled,true)}
console.log(JSON.stringify({ok:true,checks:12,scope:'existing call-ledger read adapter and sidebar access only'}));
