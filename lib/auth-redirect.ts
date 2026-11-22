// Shared by the login UI, API and legacy Sites entry point. Never trust a
// destination from a query string, request header or login body directly.
export function safeAuthReturnPath(value:unknown):string{
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\x00-\x1f\\]/.test(value))return '/';
 try{
  const url=new URL(value,'https://synapse.local');
  const decoded=decodeURIComponent(url.pathname),path=decoded.replace(/\/+$/,'')||'/';
  if(url.origin!=='https://synapse.local'||decoded.startsWith('//')||/[\x00-\x1f\\]/.test(decoded)||['/login','/signin-with-chatgpt','/signout-with-chatgpt','/callback'].includes(path)||path.startsWith('/api/auth/'))return '/';
  return url.pathname+url.search+url.hash;
 }catch{return '/'}
}
