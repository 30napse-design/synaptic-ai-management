"""Synthetic backup/restore and ordered migration rehearsal; no production files."""
import hashlib
import importlib.util
import sqlite3
import tempfile
import sys
sys.dont_write_bytecode=True
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('readiness',ROOT/'scripts/check-activation-readiness.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class ActivationBackup(unittest.TestCase):
    def test_backup_restore_and_order(self):
        with tempfile.TemporaryDirectory() as d:
            original=sqlite3.connect(':memory:')
            for p in sorted((ROOT/'drizzle').glob('*.sql')):
                if p.name<'0018': original.executescript(p.read_text())
            original.execute("INSERT INTO staff_members(email,name) VALUES('staff:old','Synthetic staff')")
            original.execute("INSERT INTO staff_accounts(username,member_id,password_hash,salt,permissions,updated_at) VALUES('old','staff:old','synthetic-hash','synthetic-salt','[\"people\"]','then')");original.commit()
            path=Path(d)/'restored.sqlite';copy=sqlite3.connect(path);original.backup(copy);copy.close()
            sha=hashlib.sha256(path.read_bytes()).hexdigest();before=mod.inspect_backup(path,sha)
            self.assertTrue(before['restore_structure_valid']);self.assertEqual(before['next_migrations'],['0018','0019']);self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),sha)
            with self.assertRaises(ValueError): mod.inspect_backup(path,'0'*64)
            copy=sqlite3.connect(path);legacy=copy.execute('SELECT * FROM staff_accounts').fetchall()
            copy.executescript((ROOT/'drizzle/0018_central_research_workflow.sql').read_text());copy.close()
            middle=mod.inspect_backup(path,hashlib.sha256(path.read_bytes()).hexdigest());self.assertEqual(middle['next_migrations'],['0019'])
            copy=sqlite3.connect(path);copy.executescript((ROOT/'drizzle/0019_organizational_roles.sql').read_text())
            self.assertEqual(copy.execute('SELECT username,member_id,password_hash,salt,must_change,permissions,updated_at FROM staff_accounts').fetchall(),legacy);copy.close()
            after=mod.inspect_backup(path,hashlib.sha256(path.read_bytes()).hexdigest());self.assertEqual(after['next_migrations'],[]);self.assertFalse(after['production_activation_authorized'])
            self.assertEqual(original.execute('SELECT * FROM staff_accounts').fetchall(),legacy);original.close()
    def test_partial_schema_blocks_automatic_advice(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'bad.sqlite';db=sqlite3.connect(path);db.execute('CREATE TABLE research_orders(id TEXT)');db.commit();db.close()
            result=mod.inspect_backup(path,hashlib.sha256(path.read_bytes()).hexdigest());self.assertEqual(result['0018'],'partial-blocked');self.assertFalse(result['restore_structure_valid']);self.assertEqual(result['next_migrations'],[])
if __name__=='__main__':unittest.main()
