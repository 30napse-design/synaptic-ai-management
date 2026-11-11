-- Optional code rollback adapter. DO NOT run on the live DB without owner approval.
-- Stop writes and back up D1/R2 first. Keep all additive work tables and files.
CREATE TABLE IF NOT EXISTS staff_work_rollback_status (record_id TEXT PRIMARY KEY, original_status TEXT NOT NULL, original_revision INTEGER NOT NULL, stored_at TEXT NOT NULL);
--> statement-breakpoint
INSERT OR IGNORE INTO staff_work_rollback_status(record_id,original_status,original_revision,stored_at) SELECT id,status,revision,datetime('now') FROM staff_records WHERE status='changes';
--> statement-breakpoint
UPDATE staff_records SET status='doing',revision=revision+1 WHERE status='changes' AND EXISTS(SELECT 1 FROM staff_work_rollback_status s WHERE s.record_id=staff_records.id AND s.original_revision=staff_records.revision);
-- To return to the new UI after a rollback, restore only untouched adapter rows:
-- UPDATE staff_records SET status='changes',revision=revision+1 WHERE status='doing' AND EXISTS(SELECT 1 FROM staff_work_rollback_status s WHERE s.record_id=staff_records.id AND s.original_revision+1=staff_records.revision);
-- Rows edited after rollback require manual reconciliation; never overwrite them.
