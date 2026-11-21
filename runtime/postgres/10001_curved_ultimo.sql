CREATE TABLE "staff_accounts" (
	"username" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"password_hash" text NOT NULL,
	"salt" text NOT NULL,
	"must_change" bigint DEFAULT 1 NOT NULL,
	"permissions" text DEFAULT '["people"]' NOT NULL,
	"updated_at" text NOT NULL
);
CREATE UNIQUE INDEX "staff_accounts_member_id_unique" ON "staff_accounts" ("member_id");
CREATE TABLE "staff_auth_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
CREATE TABLE "staff_auth_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"count" bigint DEFAULT 0 NOT NULL,
	"expires_at" bigint NOT NULL
);
CREATE TABLE "staff_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"expires_at" bigint NOT NULL
);
