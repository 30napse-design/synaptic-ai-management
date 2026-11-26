import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ticketSourceOptions,configuredWebsiteForm,ticketSourceLabel} from '../lib/ticket-sources-mapping.ts';
const app=readFileSync('app/operations/operations-app.tsx','utf8');
const data=readFileSync('lib/operations-data.ts','utf8');
const link=readFileSync('lib/operation-work-link.ts','utf8');
const manual=readFileSync('lib/operations-manual-assignment.ts','utf8');
test('all, legacy, site and direct have distinct server source predicates',()=>{
 assert.deepEqual(ticketSourceOptions.map(x=>x.id),['','site','research_order','quick_request','collaboration','contact','direct','gmail']);
 assert.equal(ticketSourceOptions[0].label,'همه منابع');
 assert.match(app,/ticketSourceOptions\.map/);
 assert.match(app,/v3-source-tabs/);
 assert.match(data,/source==='legacy'/);
 assert.match(data,/source_type='gmail'/);
 assert.match(data,/source==='site'\|\|source==='direct'/);
 assert.match(data,/json_extract\(source_labels,'\$\.ticket_source'\)/);
 assert.match(data,/source\)\{where\+=' AND 1=0'/);
});
test('same-position authorized accounts remain separate and private IDs are not swapped',()=>{
 assert.match(app,/eligible=\(record:any\)=>data\.members\.filter/);
 assert.match(app,/mayAssignWork\(u,m\.email/);
 assert.match(app,/canUseOpsCategory\(m,/);
 assert.match(app,/eligible\(selected\)\.map/);
 assert.match(app,/value=\{m\.email\}/);
 assert.doesNotMatch(app,/new Map\(data\.members/);
});
test('legacy category and precise topic remain unchanged without fabricated mapping',()=>{
 assert.match(data,/COALESCE\(json_extract\(source_labels,'\$\.ticket_v'\),0\)=0 AND category=\?/);
 assert.match(data,/source==='legacy'.*subtype=\?/s);
 assert.match(data,/operationsScope\(u,routingReady\)/);
});
test('task linking is idempotent with source, alert and permission preserved in existing system',()=>{
 assert.match(link,/const id='ops-work:'\+r\.id/);
 assert.match(link,/INSERT OR IGNORE INTO staff_records/);
 assert.match(link,/staff_work_notifications/);
 assert.match(manual,/validateManualAssignee/);
 assert.match(manual,/mayAssignWork/);
});

test('verified website forms are distinct; arbitrary titles and unconfigured IDs are not classified',()=>{
 for(const id of ['research_order','quick_request','collaboration','contact']){
  assert.equal(configuredWebsiteForm({id:'website-'+id.replaceAll('_','-'),channel:'website'}),id);
  assert.equal(configuredWebsiteForm({id:'website-'+id.replaceAll('_','-'),channel:'gmail'}),undefined);
 }
 assert.equal(configuredWebsiteForm({id:'unknown',channel:'website'}),undefined);
 assert.equal(ticketSourceLabel({channel:'website',sourceLabels:{website_form:'invalid'}}),undefined);
 assert.equal(ticketSourceLabel({channel:'website',sourceLabels:{website_form:'research_order'}}),'سفارش خدمات پژوهشی');
 assert.match(data,/json_extract\(source_labels,'\$\.website_form'\)=\?/);
});
test('researcher preview and oversight cannot broaden existing scope',()=>{
 assert.match(app,/if\(tickets&&researcher\)return <ResearcherPreview/);
 assert.match(app,/if\(view==='dispatch'\|\|tickets&&researcher\)return/);
 assert.match(data,/operationsScope\(u,routingReady\)/);
 assert.match(data,/unifiedRole==='senior_research'/);
 assert.match(data,/seniorResearchMayReview\(c.id\)/);
});

test('signed form ingestion derives metadata from configured source, not arbitrary event payload',()=>{
 const input=readFileSync('lib/input-sources.ts','utf8');
 const dispatch=readFileSync('lib/dispatch-engine.ts','utf8');
 const receive=readFileSync('app/api/integrations/receive/[id]/route.ts','utf8');
 assert.match(receive,/signedSource\(req,id,raw\)/);
 assert.match(input,/websiteForm:configuredWebsiteForm\(s\)/);
 assert.match(dispatch,/trusted&&channel==='website'&&isWebsiteFormId\(b.websiteForm\)/);
 assert.match(dispatch,/if\(!old&&\(unified\|\|websiteForm\|\|ticket\)\)/);
 assert.match(dispatch,/website_form:websiteForm/);
});
