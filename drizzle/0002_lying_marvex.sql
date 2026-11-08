CREATE TABLE `ops_items` (
	`id` text PRIMARY KEY NOT NULL,
	`source_key` text NOT NULL,
	`category` text NOT NULL,
	`subtype` text NOT NULL,
	`title` text NOT NULL,
	`source_body` text DEFAULT '' NOT NULL,
	`client_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`call_date` text DEFAULT '' NOT NULL,
	`source_type` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`source_at` text DEFAULT '' NOT NULL,
	`source_labels` text DEFAULT '[]' NOT NULL,
	`attachments` text DEFAULT '[]' NOT NULL,
	`assignee` text DEFAULT '' NOT NULL,
	`due` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`resolution` text DEFAULT '' NOT NULL,
	`payment_state` text DEFAULT 'unknown' NOT NULL,
	`manager_only` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ops_items_source_key_unique` ON `ops_items` (`source_key`);--> statement-breakpoint
CREATE TABLE `staff_profiles` (
	`member_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`job_title` text DEFAULT '' NOT NULL,
	`department` text DEFAULT '' NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ops_sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`created` integer DEFAULT 0 NOT NULL,
	`updated` integer DEFAULT 0 NOT NULL,
	`finished_at` text NOT NULL,
	`actor` text NOT NULL
);
