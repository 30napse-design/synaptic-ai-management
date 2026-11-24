import test from 'node:test';
import assert from 'node:assert/strict';
import {validTicketEntry,ticketMetadata} from '../lib/ticket-support-policy.ts';
const valid={source:'site',group:'services',category:'service_orders',topic:'ارسال پیش‌فاکتور',description:'',title:'',clientName:'علی رضایی',phone:'09123456789',email:'',reference:'05870',organization:'',due:'',requestKey:'test'};
test('approved v2 ticket taxonomy and precise responsibility',()=>{
 assert.equal(validTicketEntry(valid),true);
 const meta=ticketMetadata(valid);
 assert.equal(meta.ticket_v,2);
 assert.equal(meta.ticket_role,'scientific_reception');
 assert.equal(meta.ticket_topic,valid.topic);
 assert.equal(validTicketEntry({...valid,category:'service_finance'}),false);
 assert.equal(validTicketEntry({...valid,group:'consultation'}),false);
 assert.equal(validTicketEntry({...valid,topic:'unapproved'}),false);
});
test('direct entry requires a title and preserves category restrictions',()=>{
 assert.equal(validTicketEntry({...valid,source:'direct'}),false);
 assert.equal(validTicketEntry({...valid,source:'direct',title:'پیام جدید'}),true);
 assert.equal(validTicketEntry({...valid,source:'direct',category:'general',title:'پیام جدید'}),false);
});
test('contact validation and split financial responsibilities',()=>{
 assert.equal(validTicketEntry({...valid,phone:'',email:''}),false);
 assert.equal(validTicketEntry({...valid,phone:'',email:'bad email'}),false);
 assert.equal(validTicketEntry({...valid,clientName:'علی'}),false);
 const finance={...valid,category:'service_finance',topic:'پرداخت‌ها و واریزی‌ها'};
 assert.equal(validTicketEntry(finance),true);
 assert.equal(ticketMetadata(finance).ticket_role,'accountant');
 assert.equal(ticketMetadata({...finance,topic:'تأیید پرداخت‌ها'}).ticket_role,'finance_manager');
});
