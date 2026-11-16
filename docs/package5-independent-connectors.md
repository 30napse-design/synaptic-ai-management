# Independent deployment and connector contracts — package 5

## Source and state

Keep the full Git tree plus prior SQL migrations. No new migration is required. Source configs, health/cursors, OAuth state, AI configuration, knowledge document versions and vendor service metadata use the existing `staff_auth_settings` table with explicit prefixes (`input-source:`, `input-health:`, `input-oauth:`, `assistant:`, `knowledge:`, `lab-services:`). Existing operations, communications, finance links, tasks, notifications and central order IDs remain authoritative. Uploaded knowledge files use private R2 `knowledge/<random-id>` keys referenced in document versions. Never put this operational state into Git.

## Environment names

- `SYNAPSE_INTEGRATION_KEY`: server-only random 32+ character encryption key; AES-GCM with per-record additional authenticated data. Required to restore encrypted OAuth/model credentials. Backup/transfer through an approved private secret manager or official hosting process; it is not in Git/Drive reports and changing it without re-encryption makes saved credentials unreadable.
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`: Google Cloud web OAuth client; enable Gmail/Sheets APIs as needed and register `https://<host>/api/integrations/google/callback` exactly. OAuth consent/verification and provider quotas remain Google's requirements. Gmail requests `gmail.readonly`; Sheets requests `spreadsheets.readonly`.
- `SYNAPSE_AUTOMATION_TOKEN`: optional scheduler header credential; absent means `/api/integrations/tick` is inaccessible. Do not reuse a staff password or publish this value.
- Existing auth, AI defaults and bindings remain documented in `.env.example` and `docs/independent-runtime-fa.md`. Never rotate `STAFF_AUTH_PEPPER` as part of this package.

## Signed inbound adapter

Owner configures a source with stable ID, channel, `webhook` or `bridge`, enabled state and a unique secret. Caller POSTs UTF-8 JSON to `/api/integrations/receive/<id>`:

```json
{"events":[{"eventId":"provider-stable-id","title":"Request subject","body":"Untrusted source text","email":"client@example.invalid","phone":"","clientName":"Example","reference":"exact order code or invoice number","at":"2026-11-16T10:00:00Z","url":"https://provider.example.invalid/message/1","replyToEventId":"optional-prior-event-in-same-source"}]}
```

Headers: `x-synapse-time` is epoch milliseconds (or seconds); `x-synapse-signature` is lowercase hex HMAC-SHA256(secret, time + '.' + exact raw body). Time window is five minutes. Limits: 200 KB request, 100 events, stable event ID up to 240 chars, title 240, text 16000. Never pass credentials, account privileges, payment verification, classification instructions or executable files as authority. Contents are untrusted data; the existing rule classifier determines the responsible organizational role. Ambiguous identity/route remains in the existing review flow.

Persist source events until 2xx acknowledgement. Retrying the same immutable event ID is safe; conflicting content/reference is rejected. A batch can partly succeed; replay unchanged events, do not mint new IDs after a timeout. Independent emails do not merge solely because text matches. Explicit reply references continue the original request in the same source. Provider attachment metadata does not prove review or bank receipt.

No arbitrary outbound HTTP proxy exists. Corporate IMAP/SMTP and social/telephony/customer-portal adapters are deployment-specific external services; provision them only after selecting a legitimate provider and owner consent. Outbound messages remain manual and documented through the existing dispatch reply approval and proof flow; no hidden send retry occurs.

## Google Sheets request format

A native Sheet's configured bounded range must contain `event_id`/`شناسه رویداد`, `date`/`تاریخ` (ISO), `title`/`عنوان`, `body`/`توضیحات تماس گیرنده`. Optional columns: `clientName`/`نام`, `phone`/`شماره تماس`, `email`/`ایمیل`, `reference`/`شماره فاکتور`. Up to 100 events per range; use separate configured ranges/sources as capacity requires. Existing source workbook is never edited automatically. XLSX is not a native Sheets API resource.

## Unattended execution on Hostinger

This checkout remains a Cloudflare Worker application using D1/R2 bindings and a Vinext build. It is not a drop-in PHP/shared-hosting app. Existing runtime guide lists Cloudflare-specific storage/auth/connector contracts. Hostinger must supply a compatible runtime or an explicit future adapter for DB/bucket and trusted identity; that migration is not performed here.

With authorized Google sources configured and enabled, an external private cron can POST `/api/integrations/tick` using the scheduler header. The handler polls each enabled OAuth source, preserves per-source error state and cursors, reconciles role appointments and checks overdue requests using existing functions. A successful HTTP body also lists each source's success; `ok:false` requires operator attention. Start with hourly cadence and increase only against measured provider/runtime capacity. Do not infer unattended operation from a page refresh or saved schedule. Current legacy ChatGPT schedule is paused; no new cron has been installed.

Routine ingestion needs no publish. Connector permission failures are visible; stored data is retained. Google calls are bounded with timeouts and no hidden transport replay. OAuth refresh tokens are never sent to browsers. Restrict access to settings backups as sensitive operational data.

## AI/knowledge limits

The existing assistant has no direct finance/science mutation tools. Model remains disabled without explicit owner configuration and per-request external consent. Approved knowledge additionally needs an explicit external-use grant before its excerpts may leave the system. Knowledge retrieval uses category, permission and bounded lexical candidate filtering (40 documents, four excerpts), not a trained model or vector database. This is a minimal RAG core, not a bulk-document ingestion/indexing service. PDF/Word are private attachments with manually reviewed extracted text. OpenAI pricing/billing is external; the owner sets a conservative per-call reserve and daily request/budget values, not an assistant-imposed quota.

## Provider references

- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get

Package-5 test provider fixtures are explicit test-runner-only responses; no claim of live Gmail/OAuth/Sheets/SMTP/model verification follows from them.
