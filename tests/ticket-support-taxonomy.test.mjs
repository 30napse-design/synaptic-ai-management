import test from 'node:test';
import assert from 'node:assert/strict';
import {siteTicketCategories,directTicketCategories,getTicketCategories,hasTicketTopic} from '../lib/ticket-support-taxonomy.ts';
test('approved final invoice heading and sending topic',()=>{
 const invoices=siteTicketCategories.find(x=>x.id==='invoices');
 assert.equal(invoices.title,'پیگیری ارسال فاکتور');
 assert.ok(invoices.topics.includes('ارسال فاکتور'));
 assert.ok(invoices.topics.includes('پیگیری پیش‌فاکتور'));
 assert.ok(!invoices.topics.includes('درخواست پیش‌فاکتور'));
});
test('seven website categories, four direct categories, no duplicate IDs',()=>{
 assert.equal(siteTicketCategories.length,7);
 assert.equal(directTicketCategories.length,4);
 for(const cat of [siteTicketCategories,directTicketCategories]){
  assert.equal(new Set(cat.map(x=>x.id)).size,cat.length);
  for(const c of cat){assert.ok(c.topics.length);assert.equal(new Set(c.topics).size,c.topics.length)}
 }
});
test('dependent topic lists do not cross source or category',()=>{
 assert.equal(getTicketCategories('site')[0].id,'orders');
 assert.equal(getTicketCategories('direct')[0].id,'collaboration');
 assert.ok(hasTicketTopic('site','payments','تسویه فاکتور'));
 assert.ok(!hasTicketTopic('direct','payments','تسویه فاکتور'));
 assert.ok(!hasTicketTopic('site','invoices','ارسال رزومه'));
});
