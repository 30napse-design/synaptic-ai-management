import test from 'node:test';
import assert from 'node:assert/strict';
import { X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import tls from 'node:tls';
import net from 'node:net';
import { once } from 'node:events';
import pg from 'pg';
import { postgresTLSOptions } from '../runtime/postgres-tls.mjs';
import { supabaseRootCA } from '../runtime/certificates/supabase-root-2021.mjs';

test('Supabase direct and pooler URLs keep verified TLS and the official root after pg parses them',()=>{
 for(const host of ['db.synthetic.supabase.co','aws-0-region.pooler.supabase.com'])for(const query of ['sslmode=require','sslmode=verify-full','ssl=true','sslnegotiation=direct']){
  const options=postgresTLSOptions(`postgresql://synthetic:local-only@${host}:5432/postgres?${query}`,{});
  const client=new pg.Client(options);
  assert.equal(client.ssl.rejectUnauthorized,true);assert.equal(client.ssl.minVersion,'TLSv1.2');
  assert.ok(client.ssl.ca.includes(supabaseRootCA));assert.equal(client.ssl.checkServerIdentity,undefined);
  assert.equal(new URL(options.connectionString).searchParams.has('sslmode'),false);
 }
 const root=new X509Certificate(supabaseRootCA);assert.equal(root.ca,true);assert.equal(root.verify(root.publicKey),true);
 assert.equal(root.fingerprint256.replaceAll(':','').toLowerCase(),'807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa');
 assert.ok(Date.parse(root.validTo)>Date.now());
});
test('remote TLS cannot be disabled; unrelated hosts do not inherit Supabase trust',()=>{
 for(const query of ['sslmode=disable','sslmode=no-verify','ssl=false','ssl=0','uselibpqcompat=true'])assert.throws(()=>postgresTLSOptions('postgresql://u:p@remote.example.invalid/db?'+query,{}),/verified TLS/);
 for(const host of ['example.invalid','evil-supabase.co','pooler.supabase.com.evil.invalid'])assert.equal(postgresTLSOptions('postgresql://u:p@'+host+'/db',{}).ssl.ca,undefined);
 assert.equal(postgresTLSOptions('postgresql://u:p@localhost/db',{}).ssl,undefined);
 assert.equal(postgresTLSOptions('postgresql://u:p@[::1]/db',{}).ssl,undefined);
 assert.throws(()=>postgresTLSOptions('postgresql://private-password@[invalid',{}),e=>!e.message.includes('private-password'));
});

test('local PostgreSQL wire query verifies a private CA; unknown CA and wrong hostname fail closed',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'synapse-postgres-tls-'));
 const openssl=(...args)=>execFileSync('openssl',args,{cwd:directory,stdio:'ignore'});
 let server;const sockets=new Set();
 try{
  openssl('req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=Synthetic Test CA','-keyout','ca.key','-out','ca.pem','-addext','basicConstraints=critical,CA:TRUE');
  openssl('req','-new','-newkey','rsa:2048','-nodes','-subj','/CN=localhost','-keyout','server.key','-out','server.csr');
  writeFileSync(join(directory,'ext.cnf'),'subjectAltName=DNS:localhost\nbasicConstraints=CA:FALSE\nextendedKeyUsage=serverAuth\n');
  openssl('x509','-req','-in','server.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-days','1','-out','server.pem','-extfile','ext.cnf');
  const ca=readFileSync(join(directory,'ca.pem'),'utf8');
  for(const env of [{PGSSLROOTCERT:join(directory,'ca.pem')},{SYNAPSE_POSTGRES_CA_CERT:ca.replaceAll('\n','\\n')}])assert.equal(postgresTLSOptions('postgresql://u:p@localhost/db?sslmode=verify-full',env).ssl.ca[0],ca);
  assert.throws(()=>postgresTLSOptions('postgresql://u:p@remote.example.invalid/db',{PGSSLROOTCERT:join(directory,'missing')}),/cannot be read/);
  assert.throws(()=>postgresTLSOptions('postgresql://u:p@remote.example.invalid/db',{SYNAPSE_POSTGRES_CA_CERT:'not a certificate'}),/valid CA/);
  const context=tls.createSecureContext({key:readFileSync(join(directory,'server.key')),cert:readFileSync(join(directory,'server.pem'))});
  const i32=n=>{const b=Buffer.alloc(4);b.writeInt32BE(n);return b};
  const packet=(type,body)=>Buffer.concat([Buffer.from(type),i32(body.length+4),body]);
  server=net.createServer(socket=>{
   sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.on('error',()=>{});
   socket.once('data',sslRequest=>{
    assert.equal(sslRequest.readInt32BE(4),80877103);socket.write('S');
    const secure=new tls.TLSSocket(socket,{isServer:true,secureContext:context});secure.on('error',()=>{});
    let pending=Buffer.alloc(0),startup=true;
    secure.on('data',chunk=>{
     pending=Buffer.concat([pending,chunk]);
     while(pending.length>=(startup?4:5)){
      const length=startup?pending.readInt32BE(0):pending.readInt32BE(1)+1;if(pending.length<length)return;
      const message=pending.subarray(0,length);pending=pending.subarray(length);
      if(startup){startup=false;secure.write(Buffer.concat([packet('R',i32(0)),packet('Z',Buffer.from('I'))]));continue}
      if(message[0]===88){secure.end();return}
      assert.equal(message.subarray(5,-1).toString(),'SELECT 1');
      const field=Buffer.alloc(18);field.writeInt32BE(23,6);field.writeInt16BE(4,10);field.writeInt32BE(-1,12);
      secure.write(Buffer.concat([packet('T',Buffer.concat([Buffer.from([0,1]),Buffer.from('one\0'),field])),packet('D',Buffer.concat([Buffer.from([0,1]),i32(1),Buffer.from('1')])),packet('C',Buffer.from('SELECT 1\0')),packet('Z',Buffer.from('I'))]));
     }
    });
   });
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const url=`postgresql://synthetic:synthetic@127.0.0.1:${server.address().port}/synthetic?sslmode=verify-full&sslrootcert=${encodeURIComponent(join(directory,'ca.pem'))}`;
  const options=postgresTLSOptions(url,{}); // force correct DNS identity against the loopback-only fixture
  const good=new pg.Client({...options,ssl:{...options.ssl,servername:'localhost'},connectionTimeoutMillis:3000});
  try{await good.connect();assert.equal((await good.query('SELECT 1')).rows[0].one,1)}finally{await good.end()}
  for(const [ssl,code] of [[{...options.ssl,ca:tls.rootCertificates,servername:'localhost'},/SELF_SIGNED|UNABLE_TO_VERIFY/],[options.ssl,/ERR_TLS_CERT_ALTNAME_INVALID/]]){
   const bad=new pg.Client({...options,ssl,connectionTimeoutMillis:3000});
   try{await assert.rejects(bad.connect(),e=>code.test(e.code))}finally{await bad.end()}
  }
 }finally{
  for(const socket of sockets)socket.destroy();if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(directory,{recursive:true,force:true});
 }
});
