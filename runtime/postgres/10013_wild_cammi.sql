CREATE TABLE "science_files" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"file_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" bigint NOT NULL,
	"object_key" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL
);
