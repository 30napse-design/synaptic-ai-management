import hashlib,importlib.util,json,shutil,sqlite3,sys,tempfile,unittest
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1];spec=importlib.util.spec_from_file_location('backup',ROOT/'scripts/verify-operational-backup.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class BackupRestore(unittest.TestCase):
 def test_restored_database_and_objects_verified_and_corruption_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   src=Path(d)/'export';src.mkdir();db=sqlite3.connect(src/'database.sqlite');db.execute('CREATE TABLE files(id TEXT PRIMARY KEY,object_key TEXT NOT NULL)');db.execute("INSERT INTO files VALUES('original-stable-id','private/synthetic-proof')");db.commit();db.close();(src/'object.bin').write_bytes(b'Synthetic private object')
   sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
   manifest={'schema_version':1,'database':{'file':'database.sqlite','sha256':sha(src/'database.sqlite')},'objects':[{'key':'private/synthetic-proof','file':'object.bin','sha256':sha(src/'object.bin'),'size':len((src/'object.bin').read_bytes()),'mime':'application/octet-stream','metadata':{}}]};(src/'manifest.json').write_text(json.dumps(manifest));restored=Path(d)/'restored';shutil.copytree(src,restored);self.assertTrue(mod.verify(restored)['ok']);self.assertEqual(sqlite3.connect(restored/'database.sqlite').execute('SELECT id FROM files').fetchone()[0],'original-stable-id');(restored/'object.bin').write_bytes(b'corrupt')
   with self.assertRaises(ValueError):mod.verify(restored)
   manifest['objects']=[];(src/'manifest.json').write_text(json.dumps(manifest));self.assertIn('missing-referenced-objects',mod.verify(src)['failures'])
if __name__=='__main__':unittest.main()
