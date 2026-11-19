# FIN-05 — payment requests, outgoing commitments and expenses

## Baseline and boundaries
Branch: `feature/finance-payments-2026-11-18`. Parent: FIN-04 `93342aeac61e71f6ace7a7c4cb27e5d58c5c715c`, already including FIN-01 and Work laboratory/intake fixes. Sites metadata identifies saved version 58 source as `559e2a899d3dfdc62b30f1e342c84b9af38584c0`; that source is an ancestor of this branch. No laboratory forms, samples, results or existing history are recreated. FIN-02/03 design documents are not represented as fully implemented by this delivery.

Development only: no main modification, live migration, production database/R2/account changes, bank transfer, deployment or scheduler activation. No real financial records were imported. Actual browser/staff/production-bank acceptance is separate from isolated compiled HTTP validation.

## Canonical model and additive migration
`0022_financial_payment_requests.sql` adds `finance_payables.request_meta` and an applicant expression index. Existing rows retain an empty default and all original fields. A financial request is **the same canonical payable**, not a new parallel request/obligation table. Metadata holds immutable-version audit references, original requested amount, finance proposal, organizational links, independent states, approval, scoped grants and schedules. `finance_events` stores version/decision/payment history. Existing transactions, private files, bank rows and balanced journal remain authoritative.

New drafts have zero recognized liability; no payment or cost is inferred from draft creation. Approved requested and proposed amounts remain distinguishable; material edits append a version snapshot, revoke current review/approval/preparation and block new payments pending independent reapproval. Existing recognized obligations/history are not erased by a pending proposal. Approval adjustment cannot fall below verified net payout. Financial nature of an already recognized obligation cannot be silently switched.

Run migration 0022 **only after existing migrations 0000–0021** in an explicitly authorized environment. The test harness applies it only to disposable Miniflare D1. The Python migration test verifies an existing payable survives unchanged with an empty metadata default. This migration does not change staff roles, passwords, historical amounts, source files or customer data. If it is absent, the new request screen reports the requirement; existing finance readers continue using legacy fields. Do not blindly regenerate/replace deployed schema from a new Drizzle snapshot.

A source rollback before activation can retain the additive column/index. After real requests exist, do not roll back the authorization/writer guards to pre-FIN-05 code: the old writer does not enforce new request approval. Prepare a reviewed forward fix or restricted maintenance mode and a separately authorized secure backup before any production migration. No production backup or data recovery is claimed here.

## Roles and privacy
- `/finance/payables`: authenticated non-laboratory staff receive their own/scoped request list; finance permission receives a finance queue; primary Owner receives management decisions. `?view=my` selects personal mode for a privileged user. These are views of the same records.
- No employee list, count, search, attachment or history response contains another personal request without an explicit permitted scope. Organizational fulfillment grants reveal only the assigned request and public documents/notes, not bank accounts or private finance comments. Personal requests cannot receive an organizational fulfillment grant.
- Approval requires a different person from the applicant, including Owner's own applications. Owner may delegate approval of one request with member, expiry, amount ceiling, reason and read scope; revocation takes effect on subsequent server reads/actions. A title or technical administrator role does not grant finance/quote approval or confidential ledgers.
- Finance reviews the current version; own-request finance review is prohibited. A delegated approver can see the information needed for that request, not the complete bank or financial ledger. Existing scientific qualification gates are unaffected.
- New private file contexts live in existing `finance_files`/R2. File delivery rechecks request/field authorization. Public supporting files can be added to draft/correction; internal finance documents remain private. Existing petty file endpoints now enforce custodian record scope too.
- Request reminders live in scoped finance audit events and the request queue, never copied into broadly readable generic staff tasks/notifications. Existing generic reminder sweeps skip request events. No private payroll/loan details are sent to CRM, customers, general operations or mother-project output.

## State and money
Request, approval, execution and bank states are independent. UI summary state is derived; viewing a row, adding a note, approval or uploading proof does not transfer money or settle an obligation.

Money is integer rial in transactions/schedules; the UI labels toman. Outgoing request types include personal advance/loan/reimbursement/payroll/mission, administration, legal, research, equipment, maintenance, petty funding, enterprise loan installments, deposits, internal transfer and other expense. Personal beneficiaries are resolved from the authenticated applicant, not a forged client name. General expenses never require a fabricated research project. Research links validate an existing authorized mother project.

Finance recognition uses the existing balanced journal. Expense, asset, employee receivable, petty fund, enterprise liability reduction, deposit and internal-transfer nature remain distinct. Loan/advance and petty approvals use a funding-commitment control account; actual employee principal/petty custody funds are posted only after verified payout. This control ledger is not automatic statutory payroll, asset registration or a tax filing.

Payouts require current independent approval and prepared source/destination. Changing an already prepared beneficiary destination requires a revised request and reapproval. No direct bank-transfer call exists. An actual announced payment is one `finance_transactions` row tied to the payable; multiple partial rows may satisfy the same obligation. Normalized account/reference identity, stable action keys and atomic payable/transaction/bank-row revision checks prevent duplicate posting and conflicting concurrent writes.

Bank suggestions are not confirmation. FIN-05 verification requires an actual free imported bank row with matching account, signed amount and authorized human review. Cross-request reuse of the bank row is blocked. Independent amount/date/reference/document review remains the financial officer's responsibility; no real bank feed is activated.

Returns are independent incoming transactions linked to the original verified payout, with reason/history; original payouts remain unchanged. Returns reopen net payable balance. Employee bank repayments are separate incoming events and reduce only the employee receivable, not expense or customer debt. Documented payroll withholding uses one noncash transaction linked by its audit event to the same employee’s approved salary payable and loan. It requires an existing private payroll document and independent explicit approval authority for the loan; both payable revisions and balances are guarded atomically. It reduces salary obligation and loan principal without counting cash received/paid. Its documented reversal preserves the original transaction and reopens both balances. No payroll-calculation engine is created. Loan repayments/returns cannot exceed the remaining documented principal. Internal transfer requires both outgoing and incoming bank rows for different organizational accounts and is excluded from external cash-out/expense totals.

Settlement requires current approval, exact verified coverage, no pending payout and no unresolved mismatch. Its cash snapshot is invalidated by later transaction changes. Disbursement settlement and the employee's outstanding loan balance are displayed independently. Monetary corrections preserve previous events and journal entries.

## Existing paths and compatibility
- API: `GET /api/finance?view=payments` (optional `scope=my`, query/status/type/date/queue filters); `POST /api/finance` with `payments_` actions and stable key.
- Actions: `save`, `submit`, `review`, `decision`, `prepare`, `payment`, `verify`, `transaction_review`, `return`, `repayment`, `settle`, `note`, `grant`, `revoke`, `cancel`, `deduction`, `deduction_reverse`.
- Files: existing `/api/finance/files?request=1` upload and authorized `/api/finance/files?id=...` retrieval. Expected payable revision guards upload races; content hashes detect repeated files.
- Legacy approved laboratory statements remain the existing payable route. New manual obligations/direct account expenses are redirected to the request workflow once migration 0022 is present. Generic transaction create/verify/void cannot bypass approval on a request payable. Legacy documents, transactions and the existing vendor forms remain accessible in a collapsed authorized section.
- FIN-01 reads approved commitments/schedules and verified cash from the same ledger. Customer cash/receivable calculations and FIN-04 bank/sample/science separation remain unchanged. Incoming loan repayments/returns count as real cash entries, not customer sales.
- FIN-02/project readers can use `request_meta.project_id` for authorized internal cost references; no internal cost is added to the customer's mother financial summary. No parallel project/customer is generated.
- Bank file import stays in the existing receipt/bank path (future FIN-06); manual import is not a live bank connection.
- Verified petty funding creates one stable charge reference in existing `petty_entries` for the designated custodian. A verified funding return adds a documented negative charge correction. Those bank-linked mirrors cannot be manually rewritten/voided in petty forms. Approved actual petty expenses appear in FIN-05 by original entry ID and produce one expense journal, not a second payable/payment. Voiding an approved actual expense reverses its existing journal; historical approved expenses without an original central journal never generate a fictitious credit. Petty custodians see only their own entries/files, not global opening balances or colleagues' receipts.
- Enterprise contracts/schedules can cover multiple payment dates without cloning the contract. The approved request, not mere contract presence, authorizes each payout. Remaining due date derives from the unpaid schedule. The existing token-protected integration tick prepares scoped 7/3/day/overdue reminders for outgoing commitments and employee repayments, with stable deduplication. No schedule is activated by code delivery.

## Interface
The default employee form starts with type and title, then reveals required common/type-specific fields. Management has no everyday request-create button; authorized users can switch to their personal view. Finance has review, approved-ready and bank-review cards. Desktop uses one primary filtered table; mobile CSS displays labelled record cards. Details, decisions, transactions, documents and history share one accessible modal. Calendar dates are displayed in Persian; native input dates and machine API dates are ISO. The two-step form, file save and list reread use real APIs, not placeholder records.

## Verification commands
```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/test-finance-runtime.mjs finance-payments-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-petty-runtime.mjs
python tests/finance-payments-migration.test.py
```

Tests use temporary D1/R2, synthetic users/sessions and fake provider bindings. The focused petty regression retains import/history/receipt/review tests and real synthetic password login/change, replacing obsolete broad-administrator assumptions. Old unrelated task-assignment checks belong to the existing organizational/workflow suites and are not counted as FIN-05 acceptance.

Required live acceptance after separate authorization: approved production migration/backup, secure real employee session checks, browser desktop/mobile interaction checks, actual bank-source validation and any separately approved scheduler connection. Managed browser control was unavailable in this environment, so browser clicks/responsive screenshots and real-user acceptance are not claimed. No live deployment was attempted.

## Recorded validation — 2026-11-18
TypeScript and production Build succeeded. FIN-05 passed 304 isolated compiled HTTP checks, including payroll offsets/reversals, unit filtering, linked audit history, temporary-grant expiry, pending-return settlement blocking and concurrent replay. Existing finance passed 113 checks; FIN-04 157; dashboard 60: 634 HTTP checks across those four suites. The focused petty suite also passed synthetic password login/change, imported history/receipts, restricted finance authority, private custody and both new/previously unposted cost correction scenarios. One isolated SQLite migration preservation test passed. No real staff login, actual bank connection, browser interaction or production recovery is claimed.
