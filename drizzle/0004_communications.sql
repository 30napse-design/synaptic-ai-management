ALTER TABLE ops_items ADD COLUMN direction text NOT NULL DEFAULT 'inbound';
--> statement-breakpoint
ALTER TABLE ops_items ADD COLUMN channel text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE ops_items ADD COLUMN visit_purpose text NOT NULL DEFAULT '';
