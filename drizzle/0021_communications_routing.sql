-- Additive extension of existing operations requests, tasks, events and notifications.
ALTER TABLE ops_items ADD COLUMN routing text NOT NULL DEFAULT '{}';--> statement-breakpoint
ALTER TABLE ops_items ADD COLUMN request_state text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE ops_items ADD COLUMN match_key text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE INDEX ops_request_match ON ops_items(match_key,status);--> statement-breakpoint
CREATE TABLE ops_communications (
 id text PRIMARY KEY NOT NULL,
 request_id text NOT NULL REFERENCES ops_items(id),
 source_key text NOT NULL UNIQUE,
 direction text NOT NULL,
 channel text NOT NULL,
 sender text NOT NULL DEFAULT '',
 recipient text NOT NULL DEFAULT '',
 body text NOT NULL DEFAULT '',
 metadata text NOT NULL DEFAULT '{}',
 delivery_status text NOT NULL DEFAULT 'received',
 message_id text NOT NULL DEFAULT '',
 created_by text NOT NULL,
 created_at text NOT NULL
);--> statement-breakpoint
CREATE INDEX ops_communications_request ON ops_communications(request_id,created_at);--> statement-breakpoint
CREATE UNIQUE INDEX dispatch_task_role_unique ON staff_work_details(json_extract(details,'$.dispatchRequest'),json_extract(details,'$.assigneePosition')) WHERE json_extract(details,'$.dispatchRequest') IS NOT NULL;

--> statement-breakpoint
INSERT INTO staff_auth_settings(id,value) VALUES('dispatch_activation_at',strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO NOTHING;
