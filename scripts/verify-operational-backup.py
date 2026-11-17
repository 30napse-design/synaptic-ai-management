#!/usr/bin/env python3
"""Offline, read-only check of an owner-exported/restored D1+R2 bundle. Never contacts production."""
import argparse,hashlib,json,sqlite3
from pathlib import Path

def verify(root):
    root=Path(root).resolve();manifest=json.loads((root/'manifest.json').read_text());failures=[]
    def local(name):
        p=(root/name).resolve()
        if not p.is_relative_to(root) or not p.is_file():raise ValueError('Missing or unsafe backup file')
        return p
    def hashed(entry):
        path=local(entry['file'])
        with path.open('rb') as f: checksum=hashlib.file_digest(f,'sha256').hexdigest()
        if checksum!=entry['sha256']:raise ValueError('Checksum mismatch')
        return path
    dbfile=hashed(manifest['database']);db=sqlite3.connect(dbfile.as_uri()+'?mode=ro&immutable=1',uri=True)
    try:
        if db.execute('PRAGMA integrity_check').fetchall()!=[('ok',)]:failures.append('database-integrity')
        if db.execute('PRAGMA foreign_key_check').fetchall():failures.append('foreign-keys')
        keys=set()
        for obj in manifest['objects']:
            if obj['key'] in keys:failures.append('duplicate-object-key')
            keys.add(obj['key']);p=hashed(obj)
            if p.stat().st_size!=obj['size'] or not obj.get('mime'):failures.append('object-metadata')
        references=set()
        tables=[r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
        for table in tables:
            quoted='"'+table.replace('"','""')+'"';columns={r[1] for r in db.execute('PRAGMA table_info('+quoted+')')}
            for column in ['object_key','avatar_key','avatar_object_key']:
                if column in columns:references.update(r[0] for r in db.execute('SELECT "'+column+'" FROM '+quoted+' WHERE "'+column+'" IS NOT NULL AND "'+column+'"!=\'\''))
        if 'staff_auth_settings' in tables:
            for (value,) in db.execute("SELECT value FROM staff_auth_settings WHERE id LIKE 'knowledge:%'"):
                d=json.loads(value)
                for v in [d]+d.get('versions',[]):
                    key=(v.get('file') or {}).get('object_key')
                    if key:references.add(key)
        if references-keys:failures.append('missing-referenced-objects')
        return {'ok':not failures,'integrity_verified':not failures,'objects':len(keys),'referenced_objects':len(references),'failures':failures,'production_modified':False,'note':'Checks the supplied bundle only; remote export completeness, encryption/key custody and point-in-time consistency require owner evidence.'}
    finally:db.close()
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('bundle');a=p.parse_args()
    try:r=verify(a.bundle);print(json.dumps(r));raise SystemExit(0 if r['ok'] else 1)
    except (ValueError,KeyError,OSError,sqlite3.Error):print(json.dumps({'ok':False,'error':'invalid-or-incomplete-private-backup','production_modified':False}));raise SystemExit(1)
