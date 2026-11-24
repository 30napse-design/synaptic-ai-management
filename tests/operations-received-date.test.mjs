import test from 'node:test';
import assert from 'node:assert/strict';
import {receiptRange,tehranDay,validDay,receiptDateLabel} from '../lib/operations-date-filter.ts';
const params=(v)=>new URLSearchParams(v);
test('Tehran receipt day crosses UTC midnight correctly',()=>{
 const now=new Date('2026-11-23T21:00:00Z');
 assert.equal(tehranDay(now),'2026-11-24');
 assert.deepEqual(receiptRange(params({datePreset:'today'}),now),{invalid:false,from:'2026-11-24',to:'2026-11-24',start:'2026-11-23T20:30:00.000Z',end:'2026-11-24T20:30:00.000Z'});
 assert.equal(receiptRange(params({datePreset:'yesterday'}),now).from,'2026-11-23');
});
test('invalid and reversed custom dates are rejected',()=>{
 assert.equal(validDay('2026-02-30'),false);
 assert.equal(receiptRange(params({datePreset:'custom',dateFrom:'2026-11-24',dateTo:'2026-11-22'})).invalid,true);
 assert.equal(receiptRange(params({datePreset:'all'})),null);
});
test('week starts Saturday and month uses Persian calendar',()=>{
 const now=new Date('2026-11-24T12:00:00Z');
 assert.equal(receiptRange(params({datePreset:'week'}),now).from,'2026-11-21');
 assert.equal(receiptRange(params({datePreset:'month'}),now).from,'2026-11-22');
});
test('call date wins over synchronization timestamp',()=>{
 assert.equal(receiptDateLabel({channel:'phone',callDate:'2026-11-22',sourceAt:'2026-11-24T00:00:00Z'}),receiptDateLabel({sourceAt:'2026-11-22T12:00:00Z'}));
});
