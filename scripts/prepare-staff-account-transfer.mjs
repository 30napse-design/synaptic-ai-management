// Authorized offline transfer only. Input contains private password verifiers.
// Read JSON {manifest,state} from stdin; never pass it as a shell argument.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {accountTransferPlan,accountTransferPostgresSQL} from '../lib/staff-account-transfer.mjs';
import {AVAILABLE_PERMISSIONS} from '../lib/auth-policy.ts';
import {organizationalLogins} from '../lib/organizational-logins.ts';
const output=process.argv[2],manifestOutput=process.argv[3];
if(!output?.startsWith('/tmp/')||!manifestOutput?.startsWith('/tmp/'))throw Error('Private /tmp output paths required. Do not store operational manifests in Git.');
const input=JSON.parse(readFileSync(0,'utf8'));
const policy={owner:'ekramiihamid@gmail.com',permissions:AVAILABLE_PERMISSIONS,roles:Object.fromEntries(Object.entries(organizationalLogins).map(([r,n])=>[n,r]))};
const plan=accountTransferPlan(input.manifest,input.state,policy);
if(plan.conflicts.length)throw Error('Target conflicts require review; no SQL generated.');
const checksum=createHash('sha256').update(JSON.stringify(input.manifest)).digest('hex');
writeFileSync(output,accountTransferPostgresSQL(plan,{checksum,actor:'owner-authorized-account-transfer',at:new Date().toISOString()}),{mode:0o600,flag:'wx'});
writeFileSync(manifestOutput,JSON.stringify(input.manifest),{mode:0o600,flag:'wx'});
console.log(JSON.stringify({checksum,create:plan.create,preserved:plan.preserved,credentialsNeedVerification:plan.credentialsNeedVerification,usernames:plan.items.map(i=>i.username)}));
