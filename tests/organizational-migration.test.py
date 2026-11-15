"""0019 uses synthetic in-memory SQLite, never production credentials or data."""
import json
import sqlite3
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SQL=(ROOT/'drizzle/0019_organizational_roles.sql').read_text()

class OrganizationMigration(unittest.TestCase):
    def database(self):
        db=sqlite3.connect(':memory:')
        for p in sorted((ROOT/'drizzle').glob('*.sql')):
            if p.name<'0019': db.executescript(p.read_text())
        db.execute("INSERT INTO staff_members(email,name) VALUES('synthetic-old','Synthetic existing employee')")
        db.execute("INSERT INTO staff_accounts(username,member_id,password_hash,salt,permissions,updated_at) VALUES('synthetic-old','synthetic-old','synthetic-hash','synthetic-salt','[\"people\",\"lab\"]','then')")
        db.execute("INSERT INTO workflow_position_assignments(id,position_id,primary_member_id,created_by,created_at,updated_at) VALUES('synthetic-slot','lab_executor','synthetic-old','owner','then','then')")
        db.commit()
        return db
    def test_preserves_credentials_grants_labs_and_appointments(self):
        db=self.database()
        old=db.execute('SELECT username,member_id,password_hash,salt,must_change,permissions,updated_at FROM staff_accounts').fetchall()
        appointments=db.execute('SELECT * FROM workflow_position_assignments').fetchall()
        oldpositions=db.execute('SELECT id,code,title,permission,active,revision FROM workflow_positions').fetchall()
        tables={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        db.executescript('BEGIN;\n'+SQL+'\nCOMMIT;')
        self.assertEqual(old,db.execute('SELECT username,member_id,password_hash,salt,must_change,permissions,updated_at FROM staff_accounts').fetchall())
        self.assertEqual(appointments,db.execute('SELECT * FROM workflow_position_assignments').fetchall())
        for row in oldpositions: self.assertEqual(row,db.execute('SELECT id,code,title,permission,active,revision FROM workflow_positions WHERE id=?',(row[0],)).fetchone())
        self.assertEqual(tables,{r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")})
        self.assertEqual(db.execute('SELECT org_roles,org_proposed_roles,org_mode,scientific_qualified FROM staff_accounts').fetchone(),('[]','[]','legacy',0))
        definitions=[json.loads(r[0]) for r in db.execute("SELECT role_definition FROM workflow_positions WHERE json_extract(role_definition,'$.role_key') IS NOT NULL")]
        self.assertEqual(len(definitions),7)
        self.assertNotIn('science_approve',next(d for d in definitions if d['role_key']=='research_specialist')['permissions'])
        self.assertEqual(db.execute("SELECT COUNT(*) FROM workflow_positions WHERE json_extract(role_definition,'$.mapping_state')='proposed'").fetchone()[0],9)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM staff_events WHERE actor='migration-0019'").fetchone()[0],7)
        self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(),[])
    def test_qualification_constraint_and_rollback(self):
        db=self.database();db.executescript(SQL)
        with self.assertRaises(sqlite3.IntegrityError): db.execute("UPDATE staff_accounts SET org_mode='managed',org_roles='[\"research_specialist\"]',permissions='[\"science_approve\"]'")
        with self.assertRaises(sqlite3.IntegrityError): db.execute("UPDATE staff_accounts SET org_mode='managed',org_roles='[\"research_manager\"]',permissions='[\"science_approve\"]'")
        db.execute("UPDATE staff_accounts SET org_mode='managed',org_roles='[\"research_manager\"]',scientific_qualified=1,permissions='[\"science_approve\"]'")
        with self.assertRaises(sqlite3.IntegrityError): db.execute("UPDATE staff_accounts SET scientific_qualified=0")
        fresh=self.database();fresh.executescript('BEGIN;\n'+SQL);fresh.rollback()
        self.assertNotIn('org_roles',[r[1] for r in fresh.execute('PRAGMA table_info(staff_accounts)')])

if __name__=='__main__': unittest.main()
