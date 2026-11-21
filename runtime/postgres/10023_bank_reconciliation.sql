-- Add metadata and concurrency control to the one existing bank-row ledger.
ALTER TABLE finance_bank_rows ADD COLUMN bank_meta TEXT NOT NULL DEFAULT '{}';
ALTER TABLE finance_bank_rows ADD COLUMN revision bigint NOT NULL DEFAULT 0;
CREATE INDEX finance_bank_account_date ON finance_bank_rows(account,date);
