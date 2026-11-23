import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {legacyTicketGroup,ticketTopicAllowed,memberPositionLabel} from '../lib/ticket-staff-desk.ts';
import {orgRoleCatalog} from '../lib/org-role-catalog.ts';
import {organizationalCode} from '../lib/organizational-logins.ts';

test('ticket staff categories preserve approved final invoice wording',()=>{
 assert.equal(legacyTicketGroup('invoices'),'billing');
 assert.equal(legacyTicketGroup('payments'),'billing');
 assert.ok(ticketTopicAllowed('invoices','ارسال فاکتور'));
 assert.ok(ticketTopicAllowed('payments','تسویه فاکتور'));
 assert.ok(!ticketTopicAllowed('invoices','ارسال رزومه'));
});
test('nine organizational positions are labeled by their role rather than member name',()=>{
 assert.equal(memberPositionLabel({manager:true,name:'شخص'},orgRoleCatalog,organizationalCode),'مدیریت پژوهشکده');
 assert.equal(memberPositionLabel({username:'customer',name:'شخص'},orgRoleCatalog,organizationalCode),'پذیرش و خدمات مشتریان');
 assert.equal(memberPositionLabel({username:'it',name:'شخص'},orgRoleCatalog,organizationalCode),'فناوری اطلاعات و امنیت');
});
test('ticket-only filter bar does not remove the existing followup shortcuts',()=>{
 const app=readFileSync('app/operations/operations-app.tsx','utf8');
 const desk=readFileSync('components/operations/ticket-staff-filters.tsx','utf8');
 const data=readFileSync('lib/operations-data.ts','utf8');
 assert.match(app,/tickets\?<TicketStaffFilters/);
 assert.match(app,/desk-followups/);
 assert.match(desk,/دسته اصلی/);
 assert.match(desk,/موضوع درخواست/);
 assert.match(desk,/مسئول تیکت/);
 assert.match(data,/ticketCategory/);
 assert.match(data,/ticketTopic/);
});
