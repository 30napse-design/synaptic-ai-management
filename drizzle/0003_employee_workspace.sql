-- Authorized common work scopes; keep financial archives private. Passwords/sessions are unchanged.
UPDATE staff_accounts SET permissions='["people","projects","lab","mail","operations","calls","results_ops","development","resources","tariffs"]',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now');

--> statement-breakpoint
INSERT INTO staff_events (id,record_id,actor,action,body,created_at) VALUES ('workspace-permissions-v11','auth','ekramiihamid@gmail.com','permissions','Common operational, development and read-only resource scopes enabled for employees; shared billing archive withheld.',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
