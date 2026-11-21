CREATE TABLE "staff_events" (
	"id" text PRIMARY KEY NOT NULL,
	"record_id" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL
);
CREATE TABLE "staff_members" (
	"email" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"active" bigint DEFAULT 1 NOT NULL
);
CREATE UNIQUE INDEX "staff_members_user_id_unique" ON "staff_members" ("user_id");
CREATE TABLE "staff_records" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"assignee" text NOT NULL,
	"reviewer" text NOT NULL,
	"due" text DEFAULT '' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"ref" text DEFAULT '' NOT NULL,
	"source_url" text DEFAULT '' NOT NULL,
	"evidence_url" text DEFAULT '' NOT NULL,
	"result" text DEFAULT '' NOT NULL,
	"amount" text DEFAULT '' NOT NULL,
	"checks" text DEFAULT '[]' NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" text NOT NULL,
	"revision" bigint DEFAULT 1 NOT NULL
);
