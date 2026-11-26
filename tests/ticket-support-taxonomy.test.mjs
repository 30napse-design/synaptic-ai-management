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

import {resolveLegacyTicketTopic} from '../lib/ticket-support-taxonomy.ts';
import {unifiedIntakeCategories,intakeResponsibleRoles,intakeDefaultResponsibility} from '../lib/unified-intake-taxonomy.ts';
import {resolveInitialResponsibility,verifiedUnifiedClassification,normalizeIranPhone,unifiedRequiredAccess} from '../lib/unified-intake-routing.ts';
test('TKT-01 baseline: 10 categories, 63 category-topic entries, 9 roles',()=>{
 assert.equal(unifiedIntakeCategories.length,10);
 assert.equal(unifiedIntakeCategories.filter(c=>c.group==='services').length,6);
 assert.equal(unifiedIntakeCategories.filter(c=>c.group==='consultation').length,4);
 assert.equal(unifiedIntakeCategories.reduce((n,c)=>n+c.topics.length,0),63);
 assert.equal(intakeResponsibleRoles.length,9);
 for(const c of unifiedIntakeCategories){
  assert.equal(new Set(c.topics.map(t=>t.title)).size,c.topics.length);
  for(const t of c.topics){
   assert.ok(intakeResponsibleRoles.some(r=>r.id===t.role));
   assert.equal(intakeDefaultResponsibility(c.id,t.title).role,t.role);
   assert.equal(resolveInitialResponsibility(c.id,t.title).roleId,t.role);
   assert.equal(verifiedUnifiedClassification(c.id,t.title).role,t.role);
  }
 }
});
test('TKT-01 legacy exact matches respect original category and source',()=>{
 assert.equal(resolveLegacyTicketTopic('site','invoices','اصلاح پیش‌فاکتور').classification.role,'scientific_reception');
 assert.equal(resolveLegacyTicketTopic('site','invoices','فاکتور رسمی').classification.role,'finance_manager');
 assert.equal(resolveLegacyTicketTopic('site','results','زمان تحویل نتایج').classification.role,'scientific_project');
 assert.equal(resolveLegacyTicketTopic('direct','invoices','فاکتور رسمی').status,'needs_review');
});
test('TKT-01 ambiguous historical topics remain readable without unauthorized routing',()=>{
 for(const topic of ['ارسال فاکتور','پیگیری پیش‌فاکتور','دریافت فاکتور','مغایرت فاکتور']){
  assert.ok(hasTicketTopic('site','invoices',topic));
  const result=resolveLegacyTicketTopic('site','invoices',topic);
  assert.equal(result.status,'needs_review');
  assert.equal(result.original.topic,topic);
 }
 for(const topic of ['تسویه فاکتور','ارسال فیش واریز','استرداد وجه']){
  assert.ok(hasTicketTopic('site','payments',topic));
  assert.equal(resolveLegacyTicketTopic('site','payments',topic).status,'needs_review');
 }
 assert.equal(resolveLegacyTicketTopic('direct','general','سایر موارد').status,'needs_review');
});
test('TKT-01 unknown combinations fail closed and existing routing helpers remain intact',()=>{
 assert.equal(resolveInitialResponsibility('service_orders','فاکتور رسمی').status,'needs_review');
 assert.equal(resolveInitialResponsibility('unknown','unknown').status,'needs_review');
 assert.throws(()=>verifiedUnifiedClassification('service_orders','فاکتور رسمی'));
 assert.equal(normalizeIranPhone('۰۹۱۲۳۴۵۶۷۸۹'),'09123456789');
 assert.equal(unifiedRequiredAccess('service_finance'),'billing_ops');
 assert.match(verifiedUnifiedClassification('service_orders','ارسال پیش‌فاکتور').position,/^unified_pending_/);
});
