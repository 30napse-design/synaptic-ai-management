CREATE TABLE `laboratory_files` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`file_name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laboratory_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`group_code` text NOT NULL,
	`laboratory_id` text NOT NULL,
	`area` text NOT NULL,
	`title` text NOT NULL,
	`scope` text NOT NULL,
	`quantity` integer NOT NULL,
	`due` text DEFAULT '' NOT NULL,
	`reply_due` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`amount` integer,
	`lead_days` integer,
	`reply_notes` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laboratory_members` (
	`member_id` text PRIMARY KEY NOT NULL,
	`laboratory_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laboratory_records` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`kind` text NOT NULL,
	`version` integer NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`author_name` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laboratories` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`areas` text DEFAULT '[]' NOT NULL,
	`capabilities` text DEFAULT '' NOT NULL,
	`contact_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`private_notes` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN laboratory_id text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN work_code text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN instructions text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN progress_notes text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN progress integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN scientific_contact text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN work_version integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN acceptance text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN accepted_version integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN accepted_by text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE laboratory_jobs ADD COLUMN accepted_at text DEFAULT '' NOT NULL;

--> statement-breakpoint
CREATE UNIQUE INDEX laboratory_record_version ON laboratory_records(job_id,kind,version);
