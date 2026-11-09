CREATE TABLE `science_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`source_task_id` text DEFAULT '' NOT NULL,
	`source_operation_id` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `science_cases_number_unique` ON `science_cases` (`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `science_source_task_unique` ON `science_cases` (`source_task_id`) WHERE "science_cases"."source_task_id" <> '';--> statement-breakpoint
CREATE TABLE `science_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`case_version` integer NOT NULL,
	`kind` text NOT NULL,
	`source_id` text DEFAULT '' NOT NULL,
	`target_version` integer DEFAULT 0 NOT NULL,
	`payload` text NOT NULL,
	`actor` text NOT NULL,
	`author_name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `science_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`version` integer NOT NULL,
	`payload` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `science_case_version_unique` ON `science_versions` (`case_id`,`version`);