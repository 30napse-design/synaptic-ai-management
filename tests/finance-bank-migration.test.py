import pathlib, sqlite3, unittest

class BankMigration(unittest.TestCase):
 def test_preserves_existing_bank_rows_and_cash_history(self):
  db=sqlite3.connect(':memory:')
  root=pathlib.Path('drizzle')
  for path in sorted(root.glob('*.sql')):
   if path.name >= '0023': break
   for statement in path.read_text().split('--> statement-breakpoint'):
    if statement.strip(): db.executescript(statement)
  db.execute("INSERT INTO finance_bank_rows(id,bank_key,date,account,reference,amount_rial,description,transaction_id,created_at) VALUES('original','original-key','2026-11-18','SYNTHETIC BANK','synthetic-source',12341,'Original description','original-transaction','now')")
  before=db.execute('SELECT * FROM finance_bank_rows').fetchall()
  for statement in (root/'0023_bank_reconciliation.sql').read_text().split('--> statement-breakpoint'):
   if statement.strip(): db.executescript(statement)
  after=db.execute('SELECT * FROM finance_bank_rows').fetchall()
  self.assertEqual([r[:-2] for r in after],before)
  self.assertEqual(after[0][-2:],('{}',0))
  self.assertIsNotNone(db.execute("SELECT name FROM sqlite_master WHERE name='finance_bank_account_date'").fetchone())
  self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(),[])
  self.assertEqual(db.execute('PRAGMA integrity_check').fetchone()[0],'ok')

if __name__ == '__main__': unittest.main()
