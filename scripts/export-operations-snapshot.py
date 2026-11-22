#!/usr/bin/env python3
"""Export a COMPLETE official D1 SQLite backup, locally and read-only.
Never point this at an HTML/CSV/model-projected database viewer response.
"""
import datetime,json,os,pathlib,sqlite3,sys
TABLES = ['staff_members','research_people','workflow_position_assignments','research_orders','ops_items','staff_records','ops_communications','staff_work_details','staff_events','staff_work_notifications','ops_sync_runs','workflow_order_links','staff_work_files']
if len(sys.argv)!=3:
    sys.exit('Usage: python3 scripts/export-operations-snapshot.py /secure/full-d1.sqlite /secure/history.json')
source=pathlib.Path(sys.argv[1]).resolve(strict=True)
dest=pathlib.Path(sys.argv[2]).resolve()
if dest.is_relative_to(pathlib.Path(__file__).resolve().parents[1]):
    sys.exit('Private export must stay outside the Git repository')
con=sqlite3.connect(source.as_uri()+'?mode=ro',uri=True)
con.row_factory=sqlite3.Row
con.execute('PRAGMA query_only=ON')
if con.execute('PRAGMA integrity_check').fetchone()[0]!='ok':
    sys.exit('Source SQLite integrity check failed')
con.execute('BEGIN')
snapshot={'format':'synapse-operations-history-v1','project_id':'appgprj_6af06be01a5481918c6578c73c9b888a','consistent':True,'exported_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tables':{}}
for table in TABLES:
    cur=con.execute('SELECT * FROM "'+table+'"')
    rows=[dict(row) for row in cur.fetchall()]
    snapshot['tables'][table]={'columns':[c[0] for c in cur.description],'rows':rows,'count':len(rows),'complete':True,'truncated_values':0,'next_offset':None}
con.rollback()
con.close()
fd=os.open(dest,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f:
    json.dump(snapshot,f,ensure_ascii=False)
print(json.dumps({'exported':True,'counts':{t:v['count'] for t,v in snapshot['tables'].items()}}))
