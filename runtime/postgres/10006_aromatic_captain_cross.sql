ALTER TABLE "ops_items" ADD "request_type" text DEFAULT 'unknown' NOT NULL;
ALTER TABLE "ops_items" ADD "client_kind" text DEFAULT 'unknown' NOT NULL;
ALTER TABLE "ops_items" ADD "organization" text DEFAULT '' NOT NULL;
ALTER TABLE "ops_items" ADD "representative" text DEFAULT '' NOT NULL;
ALTER TABLE "ops_items" ADD "intake_state" text DEFAULT 'unreviewed' NOT NULL;
ALTER TABLE "ops_items" ADD "intake_notes" text DEFAULT '' NOT NULL;
ALTER TABLE "ops_items" ADD "is_ticket" bigint DEFAULT 0 NOT NULL;
ALTER TABLE "ops_items" ADD "ticket_kind" text DEFAULT 'support' NOT NULL;
