"""Offline migration/backout compatibility check. Uses SQLite in memory only."""
import sqlite3, pathlib, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
class WorkMigration(unittest.TestCase):
    def test_additive_mapping_and_safe_backout(self):
        db = sqlite3.connect(':memory:')
        files = sorted((ROOT / 'drizzle').glob('*.sql'))
        for f in files:
            if f.name >= '0017': break
            db.executescript(f.read_text())
        db.execute("INSERT INTO staff_records(id,kind,title,assignee,reviewer,created_by,updated_at,status,revision) VALUES('old','task','preserved','a','r','owner','2026-11-11','todo',7)")
        before = db.execute('SELECT * FROM staff_records').fetchall()
        db.executescript((ROOT / 'drizzle/0017_work_planning.sql').read_text())
        self.assertEqual(before, db.execute('SELECT * FROM staff_records').fetchall())
        db.execute("UPDATE staff_records SET status='changes' WHERE id='old'")
        db.execute("INSERT INTO staff_work_details VALUES('old','{\"scheduledDate\":\"2026-11-15\"}')")
        db.executescript((ROOT / 'drizzle/rollback/0017_work_planning_compat.sql').read_text())
        self.assertEqual(db.execute("SELECT status,revision FROM staff_records WHERE id='old'").fetchone(), ('doing', 8))
        self.assertEqual(db.execute('SELECT original_status,original_revision FROM staff_work_rollback_status').fetchone(), ('changes', 7))
        self.assertIn('2026-11-15', db.execute('SELECT details FROM staff_work_details').fetchone()[0])
        db.close()
if __name__ == '__main__': unittest.main()
