import test from 'node:test';
import assert from 'node:assert/strict';
import {communicationModes,modeTransport,modeFromTransport,matchingLegacySubtype,communicationTranscript} from '../lib/operations-intake-ui.ts';
test('phone and email directional modes preserve routing and communication methods',()=>{
 assert.equal(communicationModes.length,6);
 assert.equal(modeTransport('phone-in').direction,'inbound');
 assert.equal(modeTransport('phone-out').direction,'outbound');
 assert.equal(modeTransport('email-in').channel,'gmail');
 assert.equal(modeTransport('email-out').direction,'outbound');
 assert.equal(modeFromTransport('visit','manual'),'visit');
});
test('presentational topic uses an authorized legacy subtype for existing dispatch rules',()=>{
 const groups=[{id:'billing',items:['فاکتورهای ارسال‌شده','پیش‌نویس فاکتور — ارسال‌نشده','اعلام واریز یا فیش — منتظر تأیید بانک']}];
 assert.equal(matchingLegacySubtype('invoices','ارسال فاکتور',groups),'فاکتورهای ارسال‌شده');
 assert.equal(matchingLegacySubtype('invoices','پیگیری پیش‌فاکتور',groups),'پیش‌نویس فاکتور — ارسال‌نشده');
 assert.equal(matchingLegacySubtype('payments','ارسال فیش واریز',groups),'اعلام واریز یا فیش — منتظر تأیید بانک');
 assert.equal(matchingLegacySubtype('results','بازبینی نتایج',groups),'');
});
test('both mandatory conversation fields are retained in source description',()=>{
 const text=communicationTranscript('ارسال فاکتور','سلام','پیگیری می‌کنیم');
 assert.match(text,/شرح تماس \/ درخواست مشتری:\nسلام/);
 assert.match(text,/پاسخ پشتیبان \/ اقدام یا قول داده‌شده:\nپیگیری می‌کنیم/);
});

test('new topic mapping never silently assigns an unrelated subtype',()=>{
 const groups=[{id:'billing',items:['فاکتورهای ارسال‌شده']}];
 assert.equal(matchingLegacySubtype('invoices','مغایرت فاکتور',groups),'');
 assert.equal(matchingLegacySubtype('invoices','ارسال فاکتور',groups),'فاکتورهای ارسال‌شده');
});
test('all six transport modes stay directionally explicit',()=>{
 const expected=[['phone-in','inbound','phone'],['phone-out','outbound','phone'],['visit','visit','manual'],['email-in','inbound','gmail'],['email-out','outbound','gmail'],['messaging','inbound','whatsapp']];
 for(const [id,direction,channel] of expected){const m=modeTransport(id);assert.equal(m.direction,direction);assert.equal(m.channel,channel);}
});
