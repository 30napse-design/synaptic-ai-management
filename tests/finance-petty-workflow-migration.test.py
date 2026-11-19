import pathlib,sqlite3,unittest
class PettyFundMigration(unittest.TestCase):
 def test_preserves_original_global_opening_legacy_rows_and_files(self):
  d=sqlite3.connect(':memory:')
  for path in sorted(pathlib.Path('drizzle').glob('*.sql')):
   if path.name>='0024':break
   for s in path.read_text().split('--> statement-breakpoint'):
    if s.strip():d.executescript(s)
  d.execute("INSERT INTO petty_periods(id,label,opening_rial,confirmed,note,updated_at) VALUES('1405-07','Original',-100000000,0,'Original ambiguous opening','then')")
  d.execute("INSERT INTO petty_entries(id,kind,period,date,category,description,amount_rial,status,owner_id,source_key,source_raw,created_by,created_at,updated_at) VALUES('legacy','expense','1405-07','1405/07/10','Original','Original receipt',10,'legacy','synthetic','original-source','{\"difference\":-100000000}','synthetic','then','then')")
  d.execute("INSERT INTO petty_files(id,entry_id,file_name,mime,size,object_key,created_by,created_at) VALUES('old-file','legacy','original.pdf','application/pdf',10,'original-key','synthetic','then')")
  before={t:d.execute('SELECT * FROM '+t).fetchall() for t in ['petty_entries','petty_periods','petty_files']}
  for s in pathlib.Path('drizzle/0024_petty_fund_workflow.sql').read_text().split('--> statement-breakpoint'):
   if s.strip():d.executescript(s)
  for t,extra in [('petty_entries',2),('petty_periods',3),('petty_files',1)]:self.assertEqual([r[:-extra] for r in d.execute('SELECT * FROM '+t)],before[t])
  self.assertEqual(d.execute('SELECT opening_rial FROM petty_periods').fetchone()[0],-100000000)
  self.assertEqual(d.execute('SELECT fund_id FROM petty_entries').fetchone()[0],'')
  self.assertEqual(d.execute('PRAGMA integrity_check').fetchone()[0],'ok')
  self.assertEqual(d.execute('PRAGMA foreign_key_check').fetchall(),[])
if __name__=='__main__':unittest.main()
