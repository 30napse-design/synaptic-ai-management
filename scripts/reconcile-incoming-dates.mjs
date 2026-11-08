import {readFile,writeFile} from 'node:fs/promises';
import {incomingDateMarker,incomingISO} from '../lib/incoming-dates.ts';
const [rowsPath,previousPath,outputPath]=process.argv.slice(2);if(!outputPath)throw Error('Provide source rows JSON, previous imported records JSON, and output JSON');
const rows=JSON.parse(await readFile(rowsPath,'utf8')),previous=JSON.parse(await readFile(previousPath,'utf8'));
const norm=value=>{let s=String(value??'').trim().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));if(/^[\d.eE+-]+$/.test(s)&&Number.isSafeInteger(Number(s)))s=String(Number(s));return s};
const key=(name,phone)=>JSON.stringify([norm(name),norm(phone)]),groups=new Map();let date='';
for(const row of rows){const marker=incomingDateMarker(row.cells);if(marker){date=marker;continue}const c=Object.fromEntries(Object.entries(row.cells).map(([k,v])=>[k.replace(/\d/g,''),v]));if(!date||!c.B&&!c.D)continue;const k=key(c.B,c.D);if(!groups.has(k))groups.set(k,[]);groups.get(k).push({row:Number(row.row),date,sequence:norm(c.A)})}
const repaired=[];let changed=0;
for(const item of previous){const candidates=groups.get(key(item.clientName,item.phone))||[],sequence=norm(item.sourceKey.split(':').at(-2));const index=candidates.findIndex(c=>c.sequence===sequence);if(index<0)throw Error('No exact source identity/sequence match for imported row '+repaired.length);const match=candidates.splice(index,1)[0];if(item.callDate!==match.date)changed++;repaired.push({...item,callDate:match.date,sourceAt:incomingISO(match.date)})}
await writeFile(outputPath,JSON.stringify(repaired));console.log(JSON.stringify({records:repaired.length,correctedDate:changed,dates:[...new Set(repaired.map(r=>r.callDate))],sourceKeysPreserved:repaired.every((r,i)=>r.sourceKey===previous[i].sourceKey)}));
