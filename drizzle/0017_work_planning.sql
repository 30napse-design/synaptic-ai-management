CREATE TABLE staff_work_details (record_id TEXT PRIMARY KEY REFERENCES staff_records(id), details TEXT NOT NULL DEFAULT '{}');
--> statement-breakpoint
CREATE TABLE staff_work_notifications (id TEXT PRIMARY KEY, recipient TEXT NOT NULL, record_id TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL, read_at TEXT NOT NULL DEFAULT '');
--> statement-breakpoint
CREATE INDEX staff_work_notifications_recipient ON staff_work_notifications(recipient,created_at);
--> statement-breakpoint
CREATE TABLE staff_work_files (id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES staff_records(id), file_name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, object_key TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX staff_records_work_cursor ON staff_records(updated_at DESC,id);
