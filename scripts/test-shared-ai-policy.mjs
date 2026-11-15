// Unit checks only; provider fetch is replaced with an in-memory response.
import assert from 'node:assert/strict';
import {allowedModes,retrieveKnowledge,assistantConfig} from '../lib/assistant-policy.ts';
import {openAIProvider} from '../lib/assistant-provider.ts';
const employee={email:'policy@sites.test',manager:false,permissions:['people']};
assert.deepEqual(allowedModes(employee),['staff','customer']);
assert.equal(retrieveKnowledge('سیاست','management',employee).length,0);
assert.equal(assistantConfig({}).ready,false);
assert.equal(assistantConfig({SYNAPSE_AI_ENABLED:'true',OPENAI_API_KEY:'dummy'}).ready,false);
const previous=globalThis.fetch;let calls=0;
globalThis.fetch=async(url,init)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');const b=JSON.parse(init.body);assert.equal(b.store,false);assert.equal(b.max_output_tokens,100);assert.equal(b.model,'synthetic-model');assert.equal(b.tools,undefined);return Response.json({output:[{content:[{type:'output_text',text:'پاسخ ساختگی تست adapter'}]}],usage:{input_tokens:4,output_tokens:3}})};
try{const r=await openAIProvider('dummy-local-key','synthetic-model',100).answer({question:'پرسش تست',context:'راهنما',mode:'staff'});assert.equal(r.text,'پاسخ ساختگی تست adapter');assert.equal(calls,1)}finally{globalThis.fetch=previous}
console.log('PASS: mode/RAG/config boundaries and official provider payload with mocked fetch; zero external calls.');
