// SYNAPSE Hostinger Cron: one bounded, authenticated integration tick per invocation.
// Environment values are supplied by Hostinger; never put credentials in this file.
const origin = process.env.SYNAPSE_PUBLIC_ORIGIN || 'https://visionofresearch.co';
const token = process.env.SYNAPSE_AUTOMATION_TOKEN;
if (!token) {
  console.error('Missing SYNAPSE_AUTOMATION_TOKEN in Cron environment.');
  process.exitCode = 1;
} else {
  try {
    const url = new URL('/api/integrations/tick', origin);
    if (url.protocol !== 'https:' || url.hostname !== 'visionofresearch.co') {
      throw new Error('Invalid SYNAPSE_PUBLIC_ORIGIN');
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'x-synapse-automation': token, 'accept': 'application/json' },
      signal: AbortSignal.timeout(120000),
    });
    const body = await response.text();
    let result;
    try {
      result = JSON.parse(body);
    } catch {
      throw new Error('Non-JSON response from integration endpoint (HTTP ' + response.status + ')');
    }
    // Keep successful-source metrics even when another source fails.
    // Never log message contents, tokens or arbitrary upstream error details.
    const rows = Array.isArray(result.results) ? result.results : [];
    const results = rows.map(({id,ok,events,created,replayed,more,error})=>({
      id, ok: ok === true, events, created, replayed, more,
      ...(ok === true ? {} : {error: error === 'source-needs-review' ? error : 'source-error'})
    }));
    const succeeded = results.filter(r=>r.ok).length;
    const failed = results.length - succeeded;
    const status = !response.ok ? 'failed' : failed && succeeded ? 'partial' : failed || !result.ok ? 'failed' : 'completed';
    const totals = Object.fromEntries(['events','created','replayed'].map(key=>[key,results.filter(r=>r.ok).reduce((n,r)=>n+(Number.isFinite(r[key])?r[key]:0),0)]));
    const report = {httpStatus:response.status,status,succeeded,failed,totals,more:results.some(r=>r.more===true),results};
    if (status === 'completed') console.log('Integration tick completed:',JSON.stringify(report));
    else {
      console.error('Integration tick '+status+':',JSON.stringify(report));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Integration tick request error:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
