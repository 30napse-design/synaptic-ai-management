# FIN-06 — bank statements and reconciliation

## Delivery boundary and existing source

Development branch: `feature/finance-bank-2026-11-18`. Parent: FIN-05 `a16d84d6a54644dacd0b909a31bb9fe484d9ffd4`; FIN-04 `93342aeac61e71f6ace7a7c4cb27e5d58c5c715c` and saved laboratory v58 source `559e2a899d3dfdc62b30f1e342c84b9af38584c0` are ancestors. GitHub refs were fetched again before delivery; no newer remote changes were merged, overwritten or deployed. Existing customer, invoice, sample intake, mother case, laboratory order, scientific QC, result and settlement models remain authoritative. Header, account settings and AI functions are not rewritten.

No live database/R2/account/permission changes, deployment, historical imports, bank connection, cron activation, external payment or hosting migration. All execution evidence below uses compiled Workers code and disposable Miniflare D1/R2. A successful source build or synthetic session is not a production acceptance test.

## One source, two views

Canonical URL: `/finance/bank`; existing `/api/finance?view=bank`. Finance operations and authorized management views use the same source, account scopes, filters and transaction identifiers. The former bank import/table inside receipts links here rather than maintaining a second ledger. The legacy `bank_import` action remains compatible only before explicit bank registry configuration; after configuration it rejects direct imports and requires the audited preview/confirmation flow.

- Finance: summary cards, company/account/date/direction/status/search filters, staged import, one transaction table and detail drawer with proposals, evidence, classification, discrepancy, referral, decision and history.
- Management: the same scoped records, cash movement totals, daily trend, nature composition, account comparison and actual decision queue. Both cards and charts use the same last-30/50/filtered subset as the table.
- Amounts remain integer **rial**. Display/export toman preserves tenths exactly; cash movement is not labeled accounting revenue/expense. Actual account balance and complete-bank coverage remain **unknown**, not fabricated zeroes.
- Shared headers, cards, filters, tables, drawer, status labels, account selector, Persian date picker, empty/access states and report/decision panels live in `components/finance/financial-ui.tsx`. Existing modal focus/escape behavior is reused. `financial-theme.css` is scoped to finance, including RTL purple/light styling and mobile cards. All eight canonical sidebar titles are retained. Existing specialist routes remain available in the collapsed finance links.
- Shared styling does not claim completion of any unfinished FIN-02/03/07/08 business requirements. Laboratory forms and logic are untouched.

## Additive schema and activation prerequisites

`0023_bank_reconciliation.sql`, after 0000–0022, adds `bank_meta` (empty JSON default), `revision` (zero default) and account/date index **to the existing `finance_bank_rows` table**. No parallel financial request, account ledger, customer or ticket table is introduced. Schema and migration journal are included. The migration preservation test runs against an in-memory database with original linked bank data and checks integrity/foreign keys.

Company/account registry is versioned/audited in existing `finance_settings` (`bank-registry`); source files in existing private `finance_files`/R2; import checkpoints/decisions/classification/history in `finance_events`. The primary Owner maps historical ledger account labels to their legal companies, configures active accounts and grants explicit per-member bank actions. No staff account, global role or password is changed by this feature. Company/ledger identity cannot be silently renamed and accounts cannot be physically deleted; deactivate with history instead.

Compatibility: while no registry exists, the already-authorized legacy financial paths keep prior access; the new screen does not invent account permissions or activate existing staff grants. **Before real FIN-06 use, Owner must configure and approve the registry and actual account scopes**. Once configured, unmapped accounts are not exposed to staff; Owner retains history for mapping. Old unscoped statement files become Owner-only until reviewed. Never infer a legal company from a similar name or overwrite financial history to migrate it.

Source rollback can retain additive columns/index, but after bank scopes become operational, rolling back to an old writer would remove their enforcement. Use a reviewed forward fix/restricted maintenance mode rather than restoring pre-scope writers. Any production migration/activation still requires a separate explicit instruction and the existing secure D1/R2 backup/restore procedure. No recoverable production backup is claimed by this delivery; use the existing independent-runtime/export verification documentation for separately authorized data transfer.

## Audited file import

`POST /api/finance/files?bank=preview` accepts multipart `account_id` plus one real XLSX/CSV file. The server derives company and canonical ledger account from the authorized registry. Supported templates are the existing English four-column CSV or Persian template: bank transaction number, Jalali date, deposit (rial), withdrawal (rial), description/payment information. No guessed currency or fuzzy column mapping. The first XLSX sheet is used; unsupported templates fail explicitly.

The file-size/ZIP expansion and entry checks protect parsing resources, not staff usage quotas. Numeric Excel identifiers beyond safe spreadsheet precision must be supplied as text. Dates, signed integer amounts, reference/description lengths, repeated columns, duplicate references and conflicting source values are validated **before** commit. Bad/suspicious rows are retained in the manifest with reasons and skipped; they do not silently corrupt amounts or prevent valid rows from being committed.

Original bytes are hashed and stored privately. The same source cannot be attributed to another account. Repeated file bytes return the same preview/checkpoint. The manifest distinguishes valid, duplicate, invalid and suspicious rows. New source IDs share the canonical deduplication/insertion helper with the legacy import API (`lib/bank-import.ts`); prior prefixes/records are not rewritten.

`bank_import_commit` requires explicit `confirm:true`, stable key, file ID and current preview revision. Each atomic D1 batch commits at most 100 rows and a continuation checkpoint; stale concurrent revision fails, repeat completion is safe. A 201-row fixture verifies continuation at 100 and final count201. Results include created, duplicate, suspicious, invalid and concurrent-conflict counts. The collapsed import-history list exposes only imports within the current import scope; `preview_file` can reopen an authorized saved checkpoint without reuploading or reimporting data. Suggestions are calculated over existing financial events, never booked as verified funds during import. Original source reference is retained in metadata even when the lookup reference is normalized.

## Reconciliation and existing financial engines

`bankCandidates()` uses account, signed amount, date, bank reference and document evidence. Same amount/name is not an automatic customer match. Ambiguous/occupied/mismatched candidates remain visible for authorized review. Rejecting a proposal never deletes the real bank row. Classification is metadata, not a legal accounting journal.

`bank_match` reserves the selected bank row(s) using revision/CAS and an actor-bound expiring lease. Existing financial verifiers recheck that lease and bank action permission, so direct legacy/FIN-04/FIN-05 verification cannot consume a reserved or unauthorized row. Lease tokens are not returned in data models. Same-body operation IDs replay safely; conflicting or stale operations fail without a second cash event. Concurrent duplicate confirmation is explicitly tested.

- **FIN-04:** verify the existing reported customer receipt/refund through `writeFinance`; no second receipt, invoice or installment. Declared slip, proposal, bank confirmation, allocation and final settlement stay separate. Partial allocation and invoice history remain in FIN-04. Attaching imported bank evidence to an already manually verified event does not post cash/journal a second time.
- **FIN-05:** delegate to `writePaymentRequests` with current payable/transaction revisions. Approval alone never pays. Partial payouts, documented returns and outstanding commitment use the same canonical payable and transactions. Generic legacy payment bypass remains blocked.
- **FIN-07:** verified petty funding creates the existing one source-keyed charge, not a second expense. Actual petty costs stay in the existing approved-expense journal projection.
- **Transfers:** two real bank sides are required. Same-company accounts can use the existing internal-transfer engine. Cross-company movement is deliberately blocked from this simple path; Owner must determine a valid intercompany nature/obligation and decision. A bank classification or management decision by itself does not create that accounting document or transfer money.
- **FIN-08:** existing balanced journal and linked source records remain the handoff. Fee/interest classification does not invent an expense/income journal, tax filing or statutory accounting integration. Use authorized corresponding documents for actual recognition.
- **Mother case:** invoice identity and verified totals come from the existing project/FIN-04 links. No duplicate mother project or scientific approval is generated by bank reconciliation.

A confirmed bank-link correction requires a recorded approved management decision for that transaction and a free replacement with the same account/direction/amount. Old/new evidence and audit remain; the original cash amount and journal are not reposted. Ordinary rejection or a managerial reply cannot quietly unlink confirmed funds.

## Referral and privacy

Existing `ticketRecipients`, `writeInternalTicket`, workflow positions and dispatch tasks are reused. Target must resolve to the actual active organizational member, with subject, priority, due date and explicit shareable explanation. Stable referral source keys prevent duplicate tickets/tasks. The bank description, amounts, account IDs and original statement are **not automatically copied** into a broadly visible ticket. Shared ticket replies/status return to the same bank row's drawer/history. Recipients need an independent bank/file grant to open bank evidence.

API permission checks include page/model, record/company/account, action, source file, generic ledger responses, related payment projections/history and filtered exports. Bank actions are distinct `view`, `import`, `match`, `correct`, `export`, `files`, `decide`; `match`/`decide` additionally require actual financial approval authority. Technical/IT or ordinary staff titles do not confer bank authority. File download and receipt-file upload recheck account file scope. Account grant changes are Owner-only and versioned, and do not grant a new global staff role. Customers/laboratories never gain the bank ledger through a mother-case link.

## Reports and independent operation

Filtered authorized XLSX/PDF are returned by `/api/finance?view=bank&format=xlsx|pdf`. They use the selected permitted subset and include incomplete-source warning; no complete-account balance is claimed. Inline XLSX strings prevent formula execution; large numbers are not silently rounded by spreadsheet numeric precision. PDF embeds a redistribution-permitted DejaVu font and uses Unicode bidi runs to keep Persian/Latin headings and numeric dates in the right order. Actual generated PDF was rasterized and visually inspected; this is **not** a screenshot of the website.

Manual import and suggestions run in SYNAPSE Workers APIs, independent of an open ChatGPT conversation. No AI, OCR, bank API or running scheduler is needed. The existing task/reminder engine remains shared. The target 08:00 bank schedule is **inactive** until the Owner supplies/approves the real statement source, host authorization, credentials and timezone (not guessed from the browser). No automatic bank connectivity or scheduled matching is reported as operational.

## Reproducible validation

```sh
pnpm install --frozen-lockfile
node node_modules/typescript/bin/tsc --noEmit
npm run build
# Wait for the build command to finish before starting a runtime harness.
node scripts/test-finance-runtime.mjs finance-bank-runtime.mjs --package5-fixtures
node --test tests/finance-bank-bidi.test.mjs tests/bank-workbook.test.mjs
python tests/finance-bank-migration.test.py
# Each command below uses a fresh temporary DB, not a shared test database.
node scripts/test-finance-runtime.mjs finance-payments-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-petty-runtime.mjs
```

The runtime suite emits `FIN06_SCENARIOS:` JSON with ID/input/expected/result and each named PASS, and synthetic report bytes for inspecting generated files. Test data/session keys are synthetic; no live connector or bank account is used. Do not copy synthetic credentials into production.

## Actual acceptance limits

The two referenced design images were not available as attachments in this session. The shared style follows the written approved specification; exact pixel fidelity is **not verified**. The managed browser skill requires its supported Node-REPL/CUA tool, which was not exposed; no browser interaction, viewport measurement, real UI screenshots or responsive visual acceptance was performed. SSR for both roles/all eight routes and responsive CSS are implemented/tested as stated below; this does not prove actual click/focus/layout behavior in Chrome or mobile. Recharts emits dimension warnings during SSR (there is no measured browser container); interactive chart sizing still requires browser acceptance. Real screenshots remain outstanding rather than replaced by mockups.

No actual employee/password/bank login was attempted. Existing isolated petty regression does exercise synthetic login/password change; FIN-06 access checks use authenticated synthetic sessions plus Owner headers in the disposable runtime. Real staff/company/account scopes, uploaded real bank templates, connection health and live data recovery still require authorized acceptance. No live version number is claimed.

## Acceptance evidence

Final targeted result: **35 named scenarios, 305 isolated HTTP checks passed**. Related regressions: FIN-05 **304**, FIN-04 **157**, core finance **113**, FIN-01 dashboard **60** HTTP checks; existing petty synthetic authentication/privacy/history/correction suite passed. Five unit tests (bank workbook + bidi) and one migration preservation test passed. TypeScript and Build passed; final diff whitespace check passed.

| ID | Input | Expected result | Actual result |
|---|---|---|---|
| FIN06-01 | Owner config; finance attempts same | Only Owner configures immutable company/account identities | PASS |
| FIN06-02 | Canonical English CSV, explicit preview and commit | Preview posts no row; confirmed import stores one canonical row | PASS |
| FIN06-03 | Actual synthetic XLSX with Persian deposit/withdrawal columns | Shared parser imports inbound and outbound rows | PASS |
| FIN06-04 | Persian ۱۴۰۵/۰۸/۲۷ and localized integer amounts | Jalali date becomes 2026-11-18; amount remains integer rial | PASS |
| FIN06-05 | Unsupported header and file extension; impossible dates | Invalid template refused; invalid rows isolated | PASS |
| FIN06-06 | Repeated row, conflicting reference, malformed value in one file | New/duplicate/suspicious/invalid statuses isolated | PASS |
| FIN06-07 | Replay source file and same reference in overlapping CSV | Stable source/reference identity; no duplicate row | PASS |
| FIN06-08 | 201 rows and stale checkpoint; repeat commit | Batches checkpoint100; stale concurrent import409; resumable | PASS |
| FIN06-09 | Same reference/different amount, same file on wrong account | Conflict not imported; source-account identity protected | PASS |
| FIN06-10 | Issued invoice, reported receipt and bank row | Proposal does not count as verified FIN04 funds | PASS |
| FIN06-11 | Authorize proposed customer receipt | FIN04 verifies once and partial balance remains6000 | PASS |
| FIN06-12 | Duplicate match and competing cash event | Idempotent replay; no second journal or re-use bank row | PASS |
| FIN06-13 | Wrong amount with same reference | Mismatch visible; no ledger change; rejected proposal does not delete bank | PASS |
| FIN06-14 | Two equally eligible customer cash events | Ambiguous suggestions require human choice; not auto-approved | PASS |
| FIN06-15 | Customer refund and withdrawal bank row | Existing refund event reduces verified net receipt, preserves audit | PASS |
| FIN06-16 | Already verified receipt lacks imported bank evidence | Attach bank row without posting cash/journal again | PASS |
| FIN06-17 | Approved FIN05 expense2000, reported payment800 | Bank match delegates FIN05; paid800 balance1200 | PASS |
| FIN06-18 | Bank returns200 from original expense payout | Documented return reopens balance1400; original history retained | PASS |
| FIN06-19 | Petty funding500 with actual bank debit | One charge in FIN07; no duplicate expense | PASS |
| FIN06-20 | Internal transfer600 between registered accounts of same company | Both bank sides linked; financial ledger does not call transfer expense | PASS |
| FIN06-21 | Two companies; attempted simple internal transfer | Intercompany not silently treated as internal; decision does not post | PASS |
| FIN06-22 | Bank fee and interest rows; classifications | Classification does not create accounting income/expense journal | PASS |
| FIN06-23 | Confirmed source correction to same-account same-amount replacement | Owner decision required; no second cash/journal; old source/audit preserved | PASS |
| FIN06-24 | Referral of fee issue to active customer position; repeat action | Existing shared ticket engine once; raw bank details not copied | PASS |
| FIN06-25 | Owner decision hold/reject and row revision conflict | Decision states and stale mutation protected with audit | PASS |
| FIN06-26 | Unauthenticated/customer/IT/admin/research open bank API and page | Bank ledger refused to nonfinancial roles | PASS |
| FIN06-27 | FinanceA queries companyC/accountC and generic API | Company/account scopes prevent records/search/history disclosure | PASS |
| FIN06-28 | View-only finance2 attempts import,match,classify,export,files | Independent action scopes enforced beyond menu | PASS |
| FIN06-29 | CSV source file retrieval with and without account/file scope | Private R2 source only downloadable by permitted user | PASS |
| FIN06-30 | Last30/50; company/account/date/direction/search filters | Cards/charts/tables use same selected rows; no invented balance | PASS |
| FIN06-31 | Authorized XLSX and PDF export of one account/filter | Real file signatures, source disclaimer, formulas not injected, scopes preserved | PASS |
| FIN06-32 | Mother project linked to canonical invoice | FIN04/mother aggregate same verified balance; no duplicated customer/order | PASS |
| FIN06-33 | FIN08 canonical journal after transfers/refunds/returns | Balanced journal, real references, classification is not statutory ledger | PASS |
| FIN06-34 | SSR finance/management and all eight finance routes | Shared functional shell rendered; browser/mobile visual test remains explicit limitation | PASS |
| FIN06-35 | Staff session expiry; reopen bank; schema history | Invalid session denied; persisted record reload survives; migration preserves originals | PASS |

FIN06-34 PASS covers SSR and preserved route access only. Browser visual/mobile/interaction and supplied-image acceptance remain **NOT RUN**, as described above. Source rollback and production backup restoration have not been executed.
