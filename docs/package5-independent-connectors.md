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

## Completion after v47 — prepared, not published

Base: `66df78f2a1867c6aff3be34f62436284587e66a7`; development branch `feature/package5-completion-2026-11-16`. No migration or operational transfer is part of this change. The latest read-only comparison was 786 visible operations, 461 incoming calls and 303 Gmail items. These are an observation, not constants, quotas or a backup.

### Connection capabilities and truth in status

`/manage/connections` continues to use the existing sources and encrypted settings. Presets cover corporate mail, Gmail, Sheets, Drive, WhatsApp, Telegram, Bale, Rubika, Instagram, LinkedIn, website forms, telephony and customer portal. A manual URL is `link-only`; a signed bridge is `api-prepared` until a valid event is received; a Google grant alone remains unverified until a successful probe/sync for that exact source revision. A permission/provider error removes the tested status. Configuration changes require another verification. Source test does not ingest messages. Outbound delivery remains manual/documented; no social, SMTP, telephone or portal sender is invented by saving a source.

The requested four Google targets are synapticsite, histogenotechlab, histogene.result and 30napse at gmail.com. Existing ekramiihamid@gmail.com is preserved as a fifth disabled default source. Defaults are not account connections; all remain disabled unless the owner saves/authorizes them. Additional Gmail accounts require source configuration rather than code edits; unknown account namespaces use a stable mailbox hash. OAuth and the existing MCP importer share the canonical key; `histogene.result` maps to `gmail:histogene-result:<message_id>`. Existing keys are unchanged.

Gmail requests only `gmail.readonly`, verifies the account through profile, and stores independent encrypted refresh credentials per source. Pick account-specific label IDs through the real labels API and save the selected IDs plus query. Google Sheets requests `spreadsheets.readonly` plus email identity verification; choose one exact Sheet/range. Drive requests `drive.metadata.readonly` plus email identity and checks the configured folder before listing its immediate metadata. This Drive connector does **not** read full documents or automatically import/traverse a Drive corpus. Reviewed document text/files continue to use the existing knowledge upload. No sending/write scopes are requested.

Owner-only disconnect disables the source and removes its local encrypted refresh credential, increments its revision and invalidates the connection state. It deliberately does not revoke every grant of the same Google client/account, which could break another independently configured source. For provider-side grant revocation use the Google account security UI after reviewing other sources. Source rows, operations and history are retained. Keys/tokens are never returned to the browser.

### Incremental processing and recovery

The existing Google adapter/`ingest`/dispatch engine is reused. Gmail records a frozen date/query/label window, next page token and the unprocessed provider IDs before dispatch. Each accepted/rejected event checkpoints progress. New runs resume the same window; expired page tokens restart the same bounded window, and canonical deduplication prevents new tasks. Only a fully drained window advances the watermark; a five-minute overlap catches boundary arrivals. Relative Gmail day/month/year operators are frozen when a window begins. Spam, trash, sent and drafts are excluded; OTP/security and promotional messages are rejected by deterministic screening before operations. There is no AI call in intake. Invalid/conflicting events are retained as bounded ID/reason review entries, not silently converted into another event ID.

Transient provider failures retain pending IDs and use bounded exponential backoff. Permission errors are shown distinctly. A resumed source retains its last successful data and human decisions. Sheet scans use existing event IDs/communications to drain unseen rows in configured page sizes without requiring a second contact bank. A changed row is not permission to rewrite an already accepted immutable event or its workflow. The source workbook is never edited. Technical page size 1–100 and source interval are owner-configurable; no business usage quota or invented AI limit is introduced.

Existing `staff_auth_settings` stores token-owned expiring source/provider-event/scheduler leases (`input-lock:`), source windows/counters/health (`input-health:`) and owner scheduler settings (`input-scheduler`). Acquisition is CAS; renew and release require the current token. Source disable/revision changes stop checkpointing the old run. Signed bridge intake shares source locking and returns retryable 409 on contention; the caller must keep its original event IDs. Source counters distinguish processed, created, replayed/updated and rejected. The existing importer returns the same counters without adding a parallel route or database.

### Independent scheduling — disabled by default

No cron is installed. The existing POST `/api/integrations/tick` now additionally requires explicit owner activation in settings, not just presence of its server credential. The owner must first verify the external runner and stop the overlapping ChatGPT Work import for the same sources. A scheduler lease prevents overlapping ticks, source leases prevent overlapping manual/periodic sync, and intervals/backoff avoid unnecessary API reads. A backlog resumes without waiting for the normal idle interval. Due-date reconciliation/notifications run even if no email source returns new data or a provider fails.

After explicit approval, provision the existing server credential securely and configure one external job to run `node scripts/run-integration-tick.mjs` with `SYNAPSE_BASE_URL` and `SYNAPSE_AUTOMATION_TOKEN` in the runner's private environment. The runner sends one request over HTTPS, never prints its credential, never follows redirects and does not install itself or retry blindly. Server settings remain authoritative. Use existing/free host cron facilities; no paid service or subscription is required by this code. External cron availability on a chosen host has not been verified here.

### AI and reviewed knowledge

The existing OpenAI Responses adapter and owner configuration remain, with real AI disabled unless explicitly configured/approved. Customer mode now requires actual data permission rather than the common sidebar grant; management mode is limited to the owner. Knowledge document approvals, active state, versions and external-use consent remain required; owner-only history is visible. Editing reviewed text preserves its original file reference; an upload must persist before a document version is published, and a failed publication cleans up only that newly uploaded object.

An employee can explicitly choose an already permitted staff work record as context; the server rechecks record visibility and financial scope and supplies only a bounded title/body/status/due/result excerpt. This is **not** unrestricted access to central, financial or laboratory case data. Sending that excerpt to a model requires owner `allowWorkContextExternal` approval and the employee's per-request external consent; defaults deny it. Each other knowledge source still needs its own external-use grant. Model test responses remain marked, no operational mutation tools exist, and payment/scientific approval/customer sending/deletion cannot be executed by AI. Plus is not API credit. Document extraction, full-corpus indexing and migration of model/provider credentials are not implicit capabilities.

### Owner prerequisites

Create a Google Cloud Web OAuth client, enable the required Gmail/Sheets/Drive APIs, add each necessary test/authorized user under Google's consent rules, and register the exact destination `/api/integrations/google/callback`. Set Google client credentials and the integration encryption key only through the secure host process. Authorize each desired source individually, select labels/ranges/folder, probe, then approve its activation date. Do not connect or activate sources from the disabled defaults by assumption. OAuth, Cron and paid AI were not activated in this delivery. The four target accounts' real credentials and host cron permission remain owner actions.

Shared canonical provider-event leases serialize the MCP importer and OAuth adapter as well as duplicate source configurations. A busy event is retryable and remains in the pending queue; it is not counted as rejected. Import counts are durably recorded as input-import-summary events, and signed-source health retains the last counts. Screening applies to all automated intake channels, not only Gmail.

## Result Gmail wire-prefix correction — 2026-11-17

Scope: Codex technical correction on `feature/package5-completion-2026-11-16`, based on `0d1a0a7c0d0bda3d335a1b31050fd04e070f5aa9`. Work owns real assignment/case-board completion and prior records; this patch performs neither. Owner-reported reference counts are 996 operations, 513 Gmail, 461 incoming calls and unassigned totals 569/422/147. They are informational, not hard-coded application values and not a new live-count claim. The 87 result-mailbox messages are not imported or reclassified by this delivery.

### Accepted prefix and shared deduplication

The previous completion allowed `gmail:histogene-result:`; the required caller prefix is `gmail:histogene.result:`. `validOperationsSourceKey` is exposed through `lib/ops-policy.ts` and delegates to `lib/operations-source-key.ts`. The importer accepts the dotted wire spelling and normalizes it to the **existing** hyphenated namespace before validation, event locking, lookup, insert and readback. Provider message IDs are unchanged. This is an alias, not a second mailbox or database migration. Existing rows and all previous prefixes stay unchanged; the OAuth adapter continues using the original canonical namespace, so both callers replay one request/task. Returned `requests[].sourceKey` can therefore be hyphenated even when the caller supplied the dotted alias.

`get_operations_sync_config` advertises `gmail_source_aliases` separately. The prior four `gmail_accounts`, their prefix values and the personal Gmail entry are unchanged. The alias declares no automatic OAuth grant and must not be interpreted as authorization to start reading another mailbox.

Example **arguments to the existing tool**, not an instruction to execute during this Codex task:

```json
{"source":"owner-approved-result-mail-import","items":[{"sourceKey":"gmail:histogene.result:ACTUAL_PROVIDER_MESSAGE_ID","sourceType":"gmail","category":"customers","subtype":"ثبت سفارش","title":"درخواست ثبت سفارش","sourceBody":"متن واقعی درخواست جاری"}]}
```

Use the real message ID and matching allowed category/subtype. Retry with the same ID; do not substitute another mailbox prefix. The existing live tool only gains this support after the owner approves release of this source. GitHub commit success is not deployment. After publication, ChatGPT/Work may perform the separately approved transfer; independent Google OAuth is not required for that connected-ChatGPT import route.

### Exact activation checklist — software ready, no activation performed

1. **Google OAuth:** owner creates/selects a Google Cloud project and Web OAuth client; enables Gmail, Sheets and Drive APIs as required; configures consent and Google-required test-user/verification rules for the actual accounts. Register `https://synapse.ekramiihamid.chatgpt.site/api/integrations/google/callback` exactly (or the exact approved destination origin). Set `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` and the existing/preserved `SYNAPSE_INTEGRATION_KEY` through secure hosting settings, never Git/Chat/Drive reports. Do not rotate the encryption key blindly. In `/manage/connections`, save the individual account, authorize, choose allowed labels/ranges/folder and probe. Do not enable a historical scan here; the separate ChatGPT import owns that operation. The personal account is not removed or replaced.
2. **Independent Cron:** owner supplies an approved existing/free scheduler host and `SYNAPSE_BASE_URL`; securely configures the matching `SYNAPSE_AUTOMATION_TOKEN` on server and runner, confirms source intervals and that an overlapping automatic Work import for the same mailbox is stopped. Do **not** stop Work's assignment/case-management mission. Only then explicitly enable the existing scheduler gate and schedule `node scripts/run-integration-tick.mjs`. Source/canonical-event/scheduler leases already cover the common importer/adapter; no new scheduler or queue engine is introduced.
3. **Reachability:** the scheduler must reach `/api/integrations/tick` over HTTPS without interactive ChatGPT sign-in before its own token check. If a Sites access gate blocks this, do not call it independent or enable it; arrange an approved service-access path or compatible independent deployment. No cookie/bypass credential is embedded in the runner. Real host reachability and permissions have not been tested here.
4. **AI:** owner supplies an OpenAI API project/key and billing approval if real responses are wanted. Set the encrypted model key or secure `OPENAI_API_KEY`; choose model/output limits, user/global request and budget controls in the existing owner panel. Review approved knowledge and external-use permissions; selected task context needs owner permission plus employee consent. Leave disabled until approval. Plus is not API credit. No financial/scientific approval, customer send or deletion tools are given to AI.
5. **Host and recovery:** review `docs/independent-runtime-fa.md` before migration. Cloudflare Workers runtime, D1 `DB`, R2 `BUCKET` and trusted-identity/Sites/CONNECTORS paths remain explicit dependencies. Independent Google polling and the tick handler do not require a ChatGPT Work conversation, but the legacy MCP/ChatGPT connector path does. Non-Workers/shared PHP hosting still requires tested runtime/DB/storage/identity adapters; source and a successful Build do not prove operational-data recovery. Export/restore D1/R2 and transfer pepper/encryption keys separately, privately and only with owner approval. Google production consent requirements, hosting availability and paid-model charges may require separate owner action or cost; nothing was purchased or activated here.

### Focused validation and Work coordination

Four unit scenarios check alias validity, byte-for-byte old prefixes/provider IDs, invalid input rejection and unchanged prior account discovery. Eleven synthetic MCP/OAuth HTTP checks exercise the actual importer, dotted/hyphen replay, same request/task IDs, preserved human status/note/due, invalid namespace rejection and cross-path deduplication. TypeScript and Build pass; the earlier 99-check completion suite and broad finance/lab suites are not rerun.

The newly observed Work branch `docs/operations-assignment-2026-11-17` changes only `docs/operations/assignment-policy.md` and `docs/operations/assignment-execution-report.md`. Neither file is edited or merged by this patch. No code-path conflict was observed. Work must keep its own actual-data review/assignment process; Codex makes no assignment call, live sync, migration or bulk repair. Source manifest is refreshed for the same package-five branch so the new helper/tests/docs remain recoverable from GitHub.
