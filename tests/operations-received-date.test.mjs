import test from 'node:test';
import assert from 'node:assert/strict';
import {receiptRange,tehranDay,validDay,receiptDateLabel,normalizeCallDay,callDayExpression} from '../lib/operations-date-filter.ts';
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

import {PGlite} from '@electric-sql/pglite';
import {postgresQuery} from '../runtime/postgres-sql.mjs';
test('mixed Gmail and Persian ledger records sort and filter by actual receipt',async()=>{
 assert.equal(normalizeCallDay('۱۴۰۵/۹/۴'),'2026-11-25');
 assert.equal(normalizeCallDay('1405/08/23'),'2026-11-14');
 assert.equal(normalizeCallDay('1405/12/31'),'');
 assert.equal(receiptDateLabel({sourceType:'incoming',callDate:'1405/09/04',sourceAt:'2026-11-22T00:00:00Z'}),receiptDateLabel({sourceAt:'2026-11-25T12:00:00Z'}));
 const db=new PGlite();
 try{
 await db.exec("CREATE TABLE ops_items(id text,source_type text,channel text,call_date text,source_at text,created_at text)");
 for(const row of [['old','incoming','phone','1405/08/23','2026-11-25T00:00:00Z','2026-11-25'],['mail','gmail','gmail','','2026-11-22T09:00:00.000Z','2026-11-25'],['next','incoming','phone','۱۴۰۵/۰۹/۰۴','2026-11-25T00:00:00Z','2026-11-25'],['mailEarly','gmail','gmail','','2026-11-24T21:00:00.000Z','2026-11-25']])await db.query('INSERT INTO ops_items VALUES ($1,$2,$3,$4,$5,$6)',row);
 const dates=(await db.query("SELECT DISTINCT call_date FROM ops_items WHERE source_type='incoming'")).rows.map(r=>r.call_date);
 const day=callDayExpression(dates),stamp=callDayExpression(dates,true),phone="(source_type='incoming' AND "+day+" IS NOT NULL)",received="COALESCE(NULLIF(source_at,''),created_at)",order="CASE WHEN "+phone+" THEN "+stamp+" ELSE "+received+" END";
 assert.deepEqual((await db.query('SELECT id FROM ops_items ORDER BY '+order+',id')).rows.map(r=>r.id),['old','mail','next','mailEarly']);
 assert.deepEqual((await db.query('SELECT id FROM ops_items ORDER BY '+order+' DESC,id DESC')).rows.map(r=>r.id),['mailEarly','next','mail','old']);
 const range=receiptRange(params({datePreset:'custom',dateFrom:'2026-11-25',dateTo:'2026-11-25'}));
 const sql='SELECT id FROM ops_items WHERE (('+phone+' AND '+day+'>=? AND '+day+'<=?) OR (NOT '+phone+' AND '+received+'>=? AND '+received+'<?)) ORDER BY '+order+',id';
 const args=[range.from,range.to,range.start,range.end];
 assert.deepEqual((await db.query(postgresQuery(sql,args,0),args)).rows.map(r=>r.id),['next','mailEarly']);
 }finally{await db.close()}
});
