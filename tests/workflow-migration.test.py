"""Additive migration, referential integrity and rollback; synthetic SQLite only."""
import json
import sqlite3
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
MIGRATION = (ROOT / 'drizzle/0018_central_research_workflow.sql').read_text()

class CentralMigration(unittest.TestCase):
    def database(self):
        db = sqlite3.connect(':memory:')
        db.execute('PRAGMA foreign_keys=ON')
        for path in sorted((ROOT / 'drizzle').glob('*.sql')):
            if path.name[:4] < '0018':
                db.executescript(path.read_text())
        stamp = '2026-11-15T00:00:00Z'
        db.execute("INSERT INTO staff_records(id,kind,title,assignee,reviewer,created_by,updated_at) VALUES('legacy-task','task','Synthetic task','owner','owner','owner',?)", (stamp,))
        db.execute("INSERT INTO finance_documents(id,number,kind,payload,created_by,created_at,updated_at) VALUES('legacy-finance','TEST-LEGACY','invoice','{}','owner',?,?)", (stamp,stamp))
        db.execute("INSERT INTO laboratory_jobs(id,reference,area,client,service,quantity,assignee,created_by,created_at,updated_at) VALUES('legacy-job','TEST','test','Synthetic client','test',1,'owner','owner',?,?)", (stamp,stamp))
        db.commit()
        return db

    def snapshot(self, db, tables):
        return {name: db.execute('SELECT * FROM "'+name+'" ORDER BY rowid').fetchall() for name in tables}

    def test_legacy_data_untouched_and_new_constraints(self):
        db = self.database()
        tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
        before = self.snapshot(db, tables)
        db.executescript('BEGIN;\n'+MIGRATION+'\nCOMMIT;')
        self.assertEqual(before, self.snapshot(db, tables))
        self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])
        self.assertEqual(db.execute('SELECT COUNT(*) FROM workflow_positions').fetchone()[0], 11)
        for table in ['research_people','research_orders','workflow_position_assignments','workflow_order_links']:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM '+table).fetchone()[0], 0)
        db.execute("INSERT INTO research_people(id,name,create_key,created_by,created_at,updated_at) VALUES('person','Synthetic researcher','person-key','owner','now','now')")
        db.execute("INSERT INTO research_orders(id,code,researcher_id,title,current_position_id,next_action,follow_up_date,create_key,created_by,created_at,updated_at) VALUES('order','TEST-ORDER','person','Synthetic order','scientific_design','Review','2026-12-01','order-key','owner','now','now')")
        with self.assertRaises(sqlite3.IntegrityError):
            db.execute("INSERT INTO workflow_order_links(id,order_id,target_type,target_id,reason,created_by,created_at) VALUES('bad','order','lab_job','missing','test','owner','now')")
        db.execute("INSERT INTO workflow_order_links(id,order_id,target_type,target_id,reason,created_by,created_at) VALUES('link','order','lab_job','legacy-job','test','owner','now')")
        for sql in ["DELETE FROM laboratory_jobs WHERE id='legacy-job'", "DELETE FROM research_orders WHERE id='order'", "DELETE FROM workflow_order_links WHERE id='link'", "UPDATE research_orders SET code='CHANGED' WHERE id='order'", "UPDATE workflow_order_links SET target_id='different' WHERE id='link'", "UPDATE research_orders SET status='unknown' WHERE id='order'"]:
            with self.assertRaises(sqlite3.IntegrityError, msg=sql):
                db.execute(sql)
        db.execute("UPDATE workflow_order_links SET retired_at='now',retired_by='owner',retirement_reason='correct linkage' WHERE id='link'")
        self.assertEqual(db.execute('SELECT COUNT(*) FROM workflow_order_links').fetchone()[0], 1)
        with self.assertRaises(sqlite3.IntegrityError):
            db.execute("DELETE FROM laboratory_jobs WHERE id='legacy-job'")

    def test_transaction_rolls_back_a_failed_install(self):
        db = self.database()
        before = list(db.execute("SELECT name FROM sqlite_master WHERE type='table'"))
        with self.assertRaises(sqlite3.IntegrityError):
            db.executescript('BEGIN;\n'+MIGRATION+"\nINSERT INTO research_people(id,name,create_key,created_by,created_at,updated_at) VALUES('bad','','bad','owner','now','now');\nCOMMIT;")
        db.rollback()
        self.assertEqual(before, list(db.execute("SELECT name FROM sqlite_master WHERE type='table'")))
        self.assertEqual(db.execute("SELECT title FROM staff_records WHERE id='legacy-task'").fetchone()[0], 'Synthetic task')

    def test_drizzle_keeps_every_legacy_table_definition(self):
        old = json.loads((ROOT/'drizzle/meta/0017_snapshot.json').read_text())
        new = json.loads((ROOT/'drizzle/meta/0018_snapshot.json').read_text())
        for key, value in old['tables'].items():
            self.assertEqual(value, new['tables'][key], key)
        self.assertEqual(len(new['tables'])-len(old['tables']), 5)

if __name__ == '__main__':
    unittest.main()
