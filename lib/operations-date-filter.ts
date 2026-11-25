// Receipt dates and follow-up deadlines are deliberately independent.
const zone='Asia/Tehran';
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
export function tehranDay(now=new Date()){const p=Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day}
export function validDay(s:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s}
function shift(s:string,n:number){const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
// Resolve local midnight via the IANA offset rather than using the server timezone.
export function midnightUTC(day:string){const target=Date.parse(day+'T00:00:00Z');let t=target;const f=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});for(let i=0;i<3;i++){const p=Object.fromEntries(f.formatToParts(new Date(t)).map(x=>[x.type,x.value]));const local=Date.parse(p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute+':'+p.second+'Z');t+=target-local;}return new Date(t).toISOString()}
export function receiptRange(p:URLSearchParams,now=new Date()){
 const preset=p.get('datePreset')||'all',today=tehranDay(now);let from='',to='';
 if(preset==='today')from=to=today;
 else if(preset==='yesterday')from=to=shift(today,-1);
 else if(preset==='week'){from=shift(today,-((new Date(today+'T00:00:00Z').getUTCDay()+1)%7));to=shift(from,6)}
 else if(preset==='month'){// Persian calendar month, including Nowruz boundaries.
  const m=new Intl.DateTimeFormat('en-u-ca-persian',{timeZone:zone,month:'numeric',day:'numeric'});const day=Number(m.formatToParts(now).find(x=>x.type==='day')?.value);from=shift(today,1-day);let next=shift(from,28);const monthOf=(s:string)=>m.formatToParts(new Date(s+'T12:00:00Z')).find(x=>x.type==='month')?.value;while(monthOf(next)===monthOf(from))next=shift(next,1);to=shift(next,-1);
 }else if(preset==='custom'){from=p.get('dateFrom')||'';to=p.get('dateTo')||from}
 if(!from&&!to)return null;
 if(!validDay(from)||!validDay(to)||from>to)return {invalid:true as const};
 return {invalid:false as const,from,to,start:midnightUTC(from),end:midnightUTC(shift(to,1))};
}
export function receiptDateLabel(row:{callDate?:string;sourceAt?:string;createdAt?:string;channel?:string;sourceType?:string}){
 const call=(row.channel==='phone'||row.sourceType==='incoming')&&validDay(row.callDate||'')?row.callDate:'';
 const raw=call||row.sourceAt||row.createdAt||'';if(!raw)return 'تاریخ نامشخص';
 const d=new Date(validDay(raw)?raw+'T12:00:00Z':raw);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('fa-IR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d):'تاریخ نامشخص';
}
