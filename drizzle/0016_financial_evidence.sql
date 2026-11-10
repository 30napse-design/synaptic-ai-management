CREATE TABLE finance_files (
 id TEXT PRIMARY KEY NOT NULL,
 context TEXT NOT NULL,
 target_id TEXT NOT NULL DEFAULT '',
 title TEXT NOT NULL,
 report_date TEXT NOT NULL DEFAULT '',
 file_name TEXT NOT NULL,
 mime TEXT NOT NULL,
 size INTEGER NOT NULL,
 object_key TEXT NOT NULL,
 content_hash TEXT NOT NULL,
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX finance_file_dedup ON finance_files(context,target_id,content_hash);
--> statement-breakpoint
ALTER TABLE finance_tax_records ADD COLUMN details TEXT NOT NULL DEFAULT '{}';
