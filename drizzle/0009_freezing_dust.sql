CREATE TABLE `finance_bank_rows` (
	`id` text PRIMARY KEY NOT NULL,
	`bank_key` text NOT NULL,
	`account` text NOT NULL,
	`date` text NOT NULL,
	`amount_rial` integer NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`transaction_id` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_bank_rows_bank_key_unique` ON `finance_bank_rows` (`bank_key`);--> statement-breakpoint
CREATE TABLE `finance_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`accepted_version` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`source_id` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_documents_number_unique` ON `finance_documents` (`number`);--> statement-breakpoint
CREATE TABLE `finance_events` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`body` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_journal` (
	`id` text PRIMARY KEY NOT NULL,
	`source_key` text NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`lines` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_journal_source_key_unique` ON `finance_journal` (`source_key`);--> statement-breakpoint
CREATE TABLE `finance_links` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`document_version` integer NOT NULL,
	`type` text NOT NULL,
	`reference_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_payables` (
	`id` text PRIMARY KEY NOT NULL,
	`source_key` text NOT NULL,
	`lab_record_id` text DEFAULT '' NOT NULL,
	`job_id` text DEFAULT '' NOT NULL,
	`laboratory_id` text DEFAULT '' NOT NULL,
	`party` text NOT NULL,
	`description` text NOT NULL,
	`total_rial` integer NOT NULL,
	`due` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_payables_source_key_unique` ON `finance_payables` (`source_key`);--> statement-breakpoint
CREATE TABLE `finance_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_tax_records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`document_id` text DEFAULT '' NOT NULL,
	`period` text NOT NULL,
	`official_number` text DEFAULT '' NOT NULL,
	`amount_rial` integer DEFAULT 0 NOT NULL,
	`tax_rial` integer DEFAULT 0 NOT NULL,
	`evidence_url` text DEFAULT '' NOT NULL,
	`due` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`document_id` text DEFAULT '' NOT NULL,
	`payable_id` text DEFAULT '' NOT NULL,
	`amount_rial` integer NOT NULL,
	`account` text NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`paid_at` text NOT NULL,
	`party` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`evidence_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'reported' NOT NULL,
	`bank_row_id` text DEFAULT '' NOT NULL,
	`verification_note` text DEFAULT '' NOT NULL,
	`verified_by` text DEFAULT '' NOT NULL,
	`verified_at` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`version` integer NOT NULL,
	`payload` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `finance_document_version_unique` ON `finance_versions` (`document_id`,`version`);