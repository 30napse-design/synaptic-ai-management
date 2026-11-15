#!/usr/bin/env python3
"""Read-only validation of an independently restored standalone SQLite backup. No network or migration writes."""
import argparse
import hashlib
import json
import sqlite3
from pathlib import Path

def inspect_backup(path, expected):
    with path.open('rb') as stream: actual=hashlib.file_digest(stream,'sha256').hexdigest()
    if actual!=expected: raise ValueError('SHA-256 mismatch; do not activate')
    db=sqlite3.connect(path.resolve().as_uri()+'?mode=ro&immutable=1',uri=True)
    try:
        tables={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
        columns=lambda t:{r[1] for r in db.execute('PRAGMA table_info("'+t+'")')}
        stage18={'research_people','research_orders','workflow_positions','workflow_position_assignments','workflow_order_links'}
        state18='applied' if stage18<=tables else 'missing' if not stage18&tables else 'partial-blocked'
        fields={'staff_accounts':{'org_roles','org_proposed_roles','org_mode','scientific_qualified','org_revision'},'ops_items':{'access_scope'},'workflow_positions':{'role_definition'}}
        present=sum(len(required&columns(t)) for t,required in fields.items())
        state19='applied' if present==sum(map(len,fields.values())) else 'missing' if present==0 else 'partial-blocked'
        integrity=[r[0] for r in db.execute('PRAGMA integrity_check')]
        foreign_keys=db.execute('PRAGMA foreign_key_check').fetchall()
        prerequisites={'staff_accounts','staff_members','staff_records','staff_events','staff_work_details','staff_work_notifications','staff_work_files','ops_items','laboratory_jobs','finance_documents','science_cases'}<=tables
        ready=integrity==['ok'] and not foreign_keys and prerequisites and 'partial-blocked' not in [state18,state19] and not (state19=='applied' and state18!='applied')
        return {'backup_sha256':actual,'read_only':True,'integrity_ok':integrity==['ok'],'foreign_key_violations':len(foreign_keys),'prerequisites_present':prerequisites,'0018':state18,'0019':state19,'next_migrations':[s for s,state in [('0018',state18),('0019',state19)] if state=='missing'] if ready else [],'restore_structure_valid':ready,'production_activation_authorized':False,'note':'Backup file validation only; validate actual credentials, secrets, R2 restoration, target version and management approvals separately.'}
    finally: db.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('sqlite_backup',type=Path);parser.add_argument('--sha256',required=True)
    args=parser.parse_args()
    try:
        result=inspect_backup(args.sqlite_backup,args.sha256);print(json.dumps(result,indent=2));raise SystemExit(0 if result['restore_structure_valid'] else 1)
    except (ValueError,sqlite3.Error,OSError) as e: print(json.dumps({'error':str(e),'production_activation_authorized':False}));raise SystemExit(1)
