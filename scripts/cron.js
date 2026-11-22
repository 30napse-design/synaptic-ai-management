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
    if (!response.ok || !result.ok) {
      console.error('Integration tick failed:', response.status,
        JSON.stringify({ results: result.results?.map(({id,ok,error})=>({id,ok,error})) || [], error: result.error || null }));
      process.exitCode = 1;
    } else {
      // No customer contents, tokens, or private records in logs.
      console.log('Integration tick completed:',
        JSON.stringify((result.results || []).map(({id,ok,events,created,replayed,more})=>({id,ok,events,created,replayed,more}))));
    }
  } catch (error) {
    console.error('Integration tick request error:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
