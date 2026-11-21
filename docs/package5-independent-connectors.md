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


## Version 65 continuation — 2026-11-21

Baseline `24e0c07bb8c7fcd7a39822d083bef7b25b87ad6e`. The home layout is compared with its parent commit: original hero artwork, statistics-first order, two-column work layout and campus illustration are restored. The functional four shortcuts, shared header, six navigation groups, mobile keyboard protection and permissions from version 65 remain. Domain previews now live in a closed, optional section below quick actions rather than preceding the daily work cards. No personal greeting is reintroduced.

### Connection and import corrections

- `/manage/connections` exposes runtime readiness booleans only, shows missing Google settings, requires saving a source before OAuth, offers a read-only probe even while importing is disabled, label selection (multiple labels are combined with AND), incremental result counts and a local disconnect action. Source drafts stay mounted when label selection changes. Empty optional API fields do not silently discard saved label restrictions, date bounds or Gmail query.
- Google OAuth retains source-specific encrypted grants, PKCE, expiring single-use state, minimal readonly scopes and mailbox identity verification. Tokens are never returned to the settings page. Disconnect removes the local grant and disables that source with an audit event; revoking Google's account-level grant remains a separate owner action.
- The independent adapter now emits `gmail:histogene.result:`. The legacy import validator and mailbox metadata are corrected to accept the same prefix; all prior prefixes and account IDs remain. Existing hashed mailbox communication keys are recognized as aliases without renaming historical rows. No existing operations, communications, tasks, notes, statuses, invoices or staff assignments are rewritten by the implementation.
- Strict Gregorian date validation rejects rolled dates such as 2026-02-30. New/changed historical source windows require an explicit valid inclusive end day and an owner confirmation saved in the audit event. Day boundaries are UTC. Existing unchanged source configurations are preserved. Optional `sourceAt` values in legacy imports must also be valid and cannot be in the future. Generic sheet rows are prevalidated before the selected batch is written; the existing Jalali-marked call-ledger adapter and stable call identity are retained.
- Gmail paginates within a fixed start/end window, resumes an unsuccessful page and advances a completed-window watermark. A one-minute overlap allows ordinary delayed delivery and stable IDs suppress repeats. This is bounded message-list polling, not Gmail History API delivery; a retrospective mailbox import with older internal dates needs an explicitly reviewed historical window. Relative Gmail queries, if previously configured, remain in force; remove a restrictive `newer_than` query explicitly when approving older history.
- Sheets retain the full read-only source range and date-marker context, process at most 100 eligible events per request, and checkpoint the offset against a hash of the returned values. A changed source snapshot restarts traversal with existing idempotency checks; it never discards unprocessed rows. Changed contents under an existing immutable event ID require review instead of overwriting human decisions.
- A source-scoped expiring lease in existing `staff_auth_settings` excludes overlapping manual/Cron runs. A crashed run becomes retryable after 15 minutes. Failed pages retain the last committed cursor; partially received pages replay through the existing idempotency engine. The shared dispatcher and its nine organizational inboxes remain authoritative. There is no new dispatch engine, schema or migration.

### Focused verification

TypeScript and production Build passed. Only changed areas were exercised: 3 date-window unit tests, the existing 12-check call adapter/navigation contract, 34 new isolated HTTP/SSR checks and the 25-check changed-import compatibility scenario (59 HTTP/SSR checks total). The new scenario covers OAuth PKCE/scope/state replay, disabled-source probe, labels, third-mailbox legacy/native deduplication, hashed-key replay, preserved human note/status/due, lease exclusion, 130-row sheet continuation, authenticated scheduler-port execution without a browser session, unauthorized scheduler rejection, disconnect and compact home SSR. The existing compatibility fixture now explicitly approves its bounded synthetic historical window; the server gate was not weakened. Synthetic provider credentials exist only in isolated test bindings. No real provider token, historical import, live data mutation or paid AI request was used. Browser visual acceptance and actual Google owner consent are not claimed.

### Actual activation state and owner actions

Read-only Sites checks found version 65 live before this change; environment revision 18 does not register `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `SYNAPSE_AUTOMATION_TOKEN` or `OPENAI_API_KEY`. `SYNAPSE_INTEGRATION_KEY` is registered as a masked Secret: registration alone does not prove its content/length; the owner-only runtime readiness check verifies usability. Readable source settings show disabled Gmail sources without stored grants. The existing hourly ChatGPT automation is disabled and was not enabled or replaced. No runtime Secret or access policy was changed.

1. Configure a real Google Cloud Web OAuth client securely in the existing Site environment. Enable Gmail/Sheets APIs and consent settings, then register exactly `https://synapse.ekramiihamid.chatgpt.site/api/integrations/google/callback`. Preserve the existing integration encryption key; never replace it casually because it protects existing ciphertext.
2. The owner signs into SYNAPSE, saves each intended source and authorizes each Google account independently. Probe without importing, select labels/range, then explicitly enable the reviewed window. A successful probe is not an imported message or proof of unattended scheduling.
3. Independent scheduling needs a real secure `SYNAPSE_AUTOMATION_TOKEN` and an authorized host Cron calling `POST /api/integrations/tick` with `x-synapse-automation`. Record its timezone and avoid enabling the old ChatGPT job concurrently. The software port was tested with synthetic credentials; no live Cron was activated.
4. Paid AI was not activated. The existing effective runtime configuration can also use an encrypted owner-supplied key, so absence of an environment key alone is not evidence about every stored AI configuration. Real AI activation requires the owner-approved key, model and positive budget/usage settings enforced by the existing adapter. Ordinary import/classification/followup remains independent of AI.

No DNS, hosting migration, database migration, staff account change or operational data import is included. Publication on the same existing Site is authorized by this task; the deployment receipt and GitHub commit are the publication evidence, not a claim of live employee or provider acceptance.
