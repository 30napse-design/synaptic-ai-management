import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync('app/api/profile/avatar/route.ts','utf8');
const migration=readFileSync('runtime/postgres/10025_private_profile_avatars.sql','utf8');
const profile=readFileSync('app/account/profile-app.tsx','utf8');
const runtime=readFileSync('runtime/hostinger-env.mjs','utf8');
const adapter=readFileSync('runtime/postgres.mjs','utf8');
test('Hostinger branch uses private PostgreSQL because Cloudflare bucket is absent',()=>{
 assert.match(runtime,/BUCKET: undefined/);
 assert.match(route,/SYNAPSE_STANDALONE_BUILD/);
 assert.match(route,/SELECT mime_type,image_data FROM staff_profile_avatars WHERE member_id=\?/);
 assert.match(route,/INSERT INTO staff_profile_avatars/);
 assert.match(route,/ON CONFLICT\(member_id\) DO UPDATE/);
 assert.match(adapter,/if \(value instanceof Uint8Array\) return Buffer.from\(value\)/);
});
test('avatar is private, authenticated, origin-checked and validates actual bytes',()=>{
 assert.match(route,/const u=await identity\(\)/);
 assert.match(route,/req.headers.get\('origin'\)!==requestOrigin\(req\)/);
 assert.match(route,/imageType\(bytes\)/);
 assert.match(route,/mime!==f.type/);
 assert.match(route,/max=2\*1024\*1024/);
 assert.match(route,/Cache-Control.*private,no-store/);
 assert.match(route,/Vary.*Cookie/);
 assert.match(route,/keyFor\(u.email\)/);
});
test('Postgres migration is additive and scoped to profile photo with max 2 MB',()=>{
 assert.match(migration,/CREATE TABLE IF NOT EXISTS staff_profile_avatars/);
 assert.match(migration,/member_id text PRIMARY KEY/);
 assert.match(migration,/image_data bytea NOT NULL/);
 assert.match(migration,/octet_length\(image_data\) BETWEEN 1 AND 2097152/);
 assert.match(migration,/REVOKE ALL ON TABLE staff_profile_avatars FROM PUBLIC/);
 assert.doesNotMatch(migration,/DROP |UPDATE staff_members|ALTER TABLE staff_profiles/i);
});
test('existing profile image picker posts PNG/JPEG and refreshes avatar',()=>{
 assert.match(profile,/accept="image\/png,image\/jpeg/);
 assert.match(profile,/body\.set\('file',file\)/);
 assert.match(profile,/synapse-profile-updated/);
 assert.match(profile,/UserAvatar name=/);
});
