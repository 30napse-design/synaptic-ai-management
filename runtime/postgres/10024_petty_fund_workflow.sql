-- Extend the existing petty ledger; preserve unassigned historical periods/rows.
ALTER TABLE petty_entries ADD COLUMN fund_id TEXT NOT NULL DEFAULT '';
ALTER TABLE petty_entries ADD COLUMN entry_meta TEXT NOT NULL DEFAULT '{}';
ALTER TABLE petty_periods ADD COLUMN fund_id TEXT NOT NULL DEFAULT '';
ALTER TABLE petty_periods ADD COLUMN period_key TEXT NOT NULL DEFAULT '';
ALTER TABLE petty_periods ADD COLUMN period_meta TEXT NOT NULL DEFAULT '{}';
ALTER TABLE petty_files ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX petty_fund_period ON petty_entries(fund_id,period,status);
CREATE UNIQUE INDEX petty_fund_period_unique ON petty_periods(fund_id,period_key) WHERE fund_id<>'';
CREATE UNIQUE INDEX petty_file_hash_unique ON petty_files(entry_id,content_hash) WHERE content_hash<>'';
