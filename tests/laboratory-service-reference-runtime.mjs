import assert from 'node:assert/strict';
const r=await fetch('https://synapse.test/api/laboratory-center',{headers:{'oai-authenticated-user-id':'synthetic-service-reference','oai-authenticated-user-email':'ekramiihamid@gmail.com'}});assert.equal(r.status,200);const d=await r.json();
for(const [prefix,count] of [['AN:',202],['HP:',102],['CEL:',102],['GE:',79],['WB:',76],['EL:',58]])assert.equal(d.services.filter(s=>s.tariff_id.startsWith(prefix)).length,count,prefix);
assert.equal(d.services.length,619);assert.ok(d.services.filter(s=>s.tariff_id.startsWith('EL:')).every(s=>s.domain==='protein-biochemistry'&&s.method!=='در مرجع فعلی ثبت نشده'));
assert.ok(d.services.filter(s=>!s.tariff_id.startsWith('EL:')).every(s=>s.method==='در مرجع فعلی ثبت نشده'));assert.ok(!JSON.stringify(d.services).includes('unitPriceToman'));assert.ok(d.services.every(s=>s.source&&s.version));
console.log('Service reference: one isolated GET; six bank counts/619 shared IDs, EL methods and domain, no invented methods or prices passed.');
