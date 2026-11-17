// Wire aliases only: keep every existing stored namespace and provider message ID unchanged.
export function canonicalOperationsSourceKey(key:string){
 return key.replace(/^gmail:histogene\.result:/,'gmail:histogene-result:');
}
export function validOperationsSourceKey(value:unknown){
 return typeof value==='string'&&value.length<=400&&/^(gmail:(synapticsite|30napse|histogenotechlab|ekramiihamid|histogene-result|mailbox-[a-f0-9]{20}):|calls:incoming:)/.test(canonicalOperationsSourceKey(value));
}
