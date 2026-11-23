import test from 'node:test';
import assert from 'node:assert/strict';
import {validTicketEntry,ticketMetadata} from '../lib/ticket-support-policy.ts';
const valid={source:'site',category:'invoices',topic:'ارسال فاکتور',description:'',title:'',clientName:'محقق',phone:'09123456789',email:'',reference:'05870',organization:'',due:''};
test('only approved site invoice labels are accepted; empty description is allowed',()=>{
 assert.equal(validTicketEntry(valid),true);
 const meta=ticketMetadata(valid);
 assert.equal(meta.ticket_v,1);
 assert.equal(meta.ticket_category_label,'پیگیری ارسال فاکتور');
 assert.equal(meta.ticket_topic,'ارسال فاکتور');
 assert.equal(validTicketEntry({...valid,topic:'درخواست پیش‌فاکتور'}),false);
 assert.equal(validTicketEntry({...valid,category:'payments',topic:'ارسال فاکتور'}),false);
});
test('direct mode requires title and never borrows unrelated site topics',()=>{
 assert.equal(validTicketEntry({...valid,source:'direct',category:'general',topic:'پرسش عمومی',title:''}),false);
 assert.equal(validTicketEntry({...valid,source:'direct',category:'general',topic:'پرسش عمومی',title:'پیام جدید'}),true);
 assert.equal(validTicketEntry({...valid,source:'direct',category:'invoices',title:'فاکتور'}),false);
});
test('internal website categories are protected and contact details validated',()=>{
 assert.equal(validTicketEntry({...valid,category:'internal',topic:'امور کارکنان'},true),false);
 assert.equal(validTicketEntry({...valid,category:'internal',topic:'ارتباط با مدیریت'},false),false);
 assert.equal(validTicketEntry({...valid,category:'internal',topic:'ارتباط با مدیریت'},true),true);
 assert.equal(validTicketEntry({...valid,phone:'',email:''}),false);
 assert.equal(validTicketEntry({...valid,email:'bad email',phone:''}),false);
});
