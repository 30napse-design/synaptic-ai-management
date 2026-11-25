CREATE TABLE "petty_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"period" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount_rial" bigint NOT NULL,
	"evidence_url" text DEFAULT '' NOT NULL,
	"file_ids" text DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"owner_id" text NOT NULL,
	"source_key" text DEFAULT '' NOT NULL,
	"source_raw" text DEFAULT '{}' NOT NULL,
	"review_note" text DEFAULT '' NOT NULL,
	"reviewed_by" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
CREATE UNIQUE INDEX "petty_source_key_unique" ON "petty_entries" ("source_key") WHERE "petty_entries"."source_key" <> '';
CREATE TABLE "petty_events" (
	_synapse_rowid bigint GENERATED ALWAYS AS IDENTITY,
  "id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"body" text NOT NULL,
	"created_at" text NOT NULL
);
CREATE TABLE "petty_files" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"file_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" bigint NOT NULL,
	"object_key" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL
);
CREATE TABLE "petty_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"source_url" text NOT NULL,
	"payload" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL
);
CREATE TABLE "petty_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"opening_rial" bigint DEFAULT 0 NOT NULL,
	"confirmed" bigint DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL
);
