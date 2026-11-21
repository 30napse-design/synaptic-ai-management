import test from 'node:test';
import assert from 'node:assert/strict';
import {inputDay,inputRange,inputTimestamp} from '../lib/input-window.ts';
test('invalid dates never roll into a different day',()=>{for(const day of ['2026-02-30','2026-13-01','2026-11-31','1405-08-30'])assert.equal(inputDay(day),false);assert.equal(inputDay('2028-02-29'),true)});
test('historical range has an explicit valid order',()=>{assert.equal(inputRange('2026-05-21','2026-11-21'),true);assert.equal(inputRange('2026-11-21','2026-05-21'),false);assert.equal(inputRange('2026-02-30',''),false)});
test('timestamps require an explicit timezone and valid clock',()=>{assert.equal(inputTimestamp('2026-11-21T24:00:00Z'),'');assert.equal(inputTimestamp('2026-11-21T10:30:00'),'');assert.equal(inputTimestamp('2026-11-21T10:30:00+04:00'),'2026-11-21T06:30:00.000Z')});
