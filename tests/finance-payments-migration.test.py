import pathlib, sqlite3, unittest
class PaymentRequestMigration(unittest.TestCase):
 def test_extends_payable_without_changing_legacy_obligations(self):
  db=sqlite3.connect(':memory:')
  db.execute('CREATE TABLE finance_payables(id TEXT PRIMARY KEY,source_key TEXT,party TEXT,description TEXT,total_rial INTEGER,due TEXT,revision INTEGER,created_by TEXT,created_at TEXT)')
  db.execute("INSERT INTO finance_payables VALUES('legacy','statement:fixture','Synthetic vendor','Original obligation',12345,'2026-12-01',7,'fixture','2026-11-01')")
  before=db.execute('SELECT * FROM finance_payables').fetchone()
  migration=pathlib.Path('drizzle/0022_financial_payment_requests.sql').read_text()
  for statement in migration.split('--> statement-breakpoint'):
   if statement.strip():db.executescript(statement)
  after=db.execute('SELECT * FROM finance_payables').fetchone()
  self.assertEqual(after[:-1],before);self.assertEqual(after[-1],'')
  self.assertIsNotNone(db.execute("SELECT name FROM sqlite_master WHERE name='finance_payment_request_applicant'").fetchone())
  db.execute("INSERT INTO finance_payables(id,request_meta) VALUES('new',?)",('{"applicant":"fixture","request_state":"draft"}',))
  self.assertEqual(db.execute("SELECT COUNT(*) FROM finance_payables WHERE json_extract(NULLIF(request_meta,''),'$.applicant')='fixture'").fetchone()[0],1)
if __name__=='__main__':unittest.main()
