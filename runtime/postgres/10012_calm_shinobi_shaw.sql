CREATE TABLE "science_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"payload" text NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source_task_id" text DEFAULT '' NOT NULL,
	"source_operation_id" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
CREATE UNIQUE INDEX "science_cases_number_unique" ON "science_cases" ("number");
CREATE UNIQUE INDEX "science_source_task_unique" ON "science_cases" ("source_task_id") WHERE "science_cases"."source_task_id" <> '';
CREATE TABLE "science_entries" (
	_synapse_rowid bigint GENERATED ALWAYS AS IDENTITY,
  "id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"case_version" bigint NOT NULL,
	"kind" text NOT NULL,
	"source_id" text DEFAULT '' NOT NULL,
	"target_version" bigint DEFAULT 0 NOT NULL,
	"payload" text NOT NULL,
	"actor" text NOT NULL,
	"author_name" text NOT NULL,
	"created_at" text NOT NULL
);
CREATE TABLE "science_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"version" bigint NOT NULL,
	"payload" text NOT NULL,
	"actor" text NOT NULL,
	"created_at" text NOT NULL
);
CREATE UNIQUE INDEX "science_case_version_unique" ON "science_versions" ("case_id","version");
