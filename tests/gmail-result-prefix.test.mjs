import assert from 'node:assert/strict';
import {canonicalOperationsSourceKey,validOperationsSourceKey} from '../lib/operations-source-key.ts';
import {readFileSync} from 'node:fs';
const cases=[];function test(name,run){run();cases.push(name)}
test('dotted result alias is accepted and uses the existing lock/storage namespace',()=>{assert.equal(canonicalOperationsSourceKey('gmail:histogene.result:message-1'),'gmail:histogene-result:message-1');assert.ok(validOperationsSourceKey('gmail:histogene.result:message-1'));assert.equal(canonicalOperationsSourceKey('gmail:histogene-result:message-1'),'gmail:histogene-result:message-1')});
test('all prior prefixes and message identifiers remain byte-for-byte unchanged',()=>{for(const prefix of ['synapticsite','30napse','histogenotechlab','ekramiihamid','histogene-result','mailbox-'+('a'.repeat(20))]){const key='gmail:'+prefix+':provider.ID-123';assert.ok(validOperationsSourceKey(key));assert.equal(canonicalOperationsSourceKey(key),key)}assert.equal(canonicalOperationsSourceKey('calls:incoming:fixture:1'),'calls:incoming:fixture:1')});
test('unapproved mailbox prefix, non-string and oversized keys still fail',()=>{for(const key of ['gmail:unknown:id','gmail:histogeneXresult:id',null,{},'gmail:histogene.result:'+('x'.repeat(401))])assert.equal(validOperationsSourceKey(key),false)});
test('discovery advertises alias without changing the prior four account registrations',()=>{const c=JSON.parse(readFileSync(new URL('../lib/ops-sync-config.json',import.meta.url),'utf8'));assert.deepEqual(c.gmail_accounts.map(a=>a.source_prefix),['gmail:synapticsite:','gmail:30napse:','gmail:histogenotechlab:','gmail:ekramiihamid:']);assert.equal(c.gmail_source_aliases[0].accepted_prefix,'gmail:histogene.result:');assert.equal(c.gmail_source_aliases[0].automatic_api_oauth,false)});

console.log(JSON.stringify({ok:true,cases:cases.length,scope:'result Gmail alias and unchanged legacy source keys'}));
