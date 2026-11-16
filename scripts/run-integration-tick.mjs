// External cron adapter only. Installing/running it requires owner approval; nothing schedules itself.
const base=process.env.SYNAPSE_BASE_URL,token=process.env.SYNAPSE_AUTOMATION_TOKEN;
if(!base||!token){console.error('Configure SYNAPSE_BASE_URL and the server scheduler credential securely.');process.exit(2)}
const url=new URL('/api/integrations/tick',base);if(url.protocol!=='https:'){console.error('HTTPS is required.');process.exit(2)}
try{const r=await fetch(url,{method:'POST',headers:{'x-synapse-automation':token},redirect:'error',signal:AbortSignal.timeout(90000)});const d=await r.json();console.log(JSON.stringify({status:r.status,ok:d.ok,skipped:d.skipped,followup:d.followup,results:d.results}));if(!r.ok||!d.ok)process.exitCode=1}catch{console.error('Tick failed; inspect source health. No automatic client retry was attempted.');process.exitCode=1}
