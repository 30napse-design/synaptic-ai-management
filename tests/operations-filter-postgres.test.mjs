import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {postgresQuery} from '../runtime/postgres-sql.mjs';
import {filterCategorySQL,filterGroupSQL,filterRoleSQL} from '../lib/operations-filter-classification.ts';
test('historical and current ticket filters execute in PostgreSQL',async()=>{
 const db=new PGlite();
 try{
 await db.exec(readFileSync('runtime/postgres/0000_functions.sql','utf8'));
 await db.exec("CREATE TABLE ops_items(id text,category text,subtype text,source_labels text)");
 const rows=[['old','customers','مشاوره پیش از سفارش','[]'],['new','customers','ثبت سفارش',JSON.stringify({intake_v:2,intake_category:'service_orders',intake_role:'scientific_reception'})],['unknown','system','نیازمند بررسی','[]'],['legacyVersion','customers','ثبت سفارش',JSON.stringify({ticket_v:1})]];
 for(const row of rows)await db.query('INSERT INTO ops_items VALUES ($1,$2,$3,$4)',row);
 const select=async(expr,value)=>(await db.query(postgresQuery('SELECT id FROM ops_items WHERE '+expr+'=? ORDER BY id',[value],0),[value])).rows.map(r=>r.id);
 assert.deepEqual(await select(filterCategorySQL,'consult_before'),['old']);
 assert.deepEqual(await select(filterGroupSQL,'services'),['legacyVersion','new']);
 assert.deepEqual(await select(filterRoleSQL,'scientific_reception'),['new']);
 assert.deepEqual((await db.query(postgresQuery('SELECT id FROM ops_items WHERE '+filterCategorySQL+' IS NULL',[],0))).rows.map(r=>r.id),['unknown']);
 assert.equal((await db.query(postgresQuery("SELECT COUNT(*) AS n FROM ops_items WHERE COALESCE(json_extract(source_labels,'$.ticket_v'),0)=0",[],0))).rows[0].n,3);
 }finally{await db.close()}
});
