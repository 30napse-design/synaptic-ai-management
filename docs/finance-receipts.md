# FIN-04 — customer receipts, installments and settlement

## Scope and source
Development route: `/finance/receipts`; API: `GET /api/finance?view=receipts`, existing `POST /api/finance`. Based on FIN-01 and Work commit `559e2a8`, preserved by merge `6303d30`. FIN-02 and FIN-03 remain design references; this delivery does not claim their full implementation. No migration, production data change, account replacement, live deployment or scheduler activation is part of this change.

Canonical entities remain `finance_documents`, immutable `finance_versions`, `finance_transactions`, `finance_bank_rows`, balanced `finance_journal`, `finance_events`, private `finance_files`, existing mother-project details and typed workflow links. No customer, invoice, laboratory, ticket or accounting database is duplicated.

## Rules
- Transaction amounts and allocations are integer rial; invoice payload amounts and UI display use toman. Only verified receipt minus verified refund constitutes invoice proceeds. Uploaded files and bank suggestions do not book money.
- Case identity follows existing document IDs, mother invoice/project IDs and explicit researcher/order links. Missing links are displayed as incomplete; names never authorize automatic merging.
- The mother upload path remains intact. A real, attributable receipt file creates the existing financial review and, when the existing management approval/order exists, one Research Specialist handoff. An amount-only declaration does not create this handoff. Rejected/mismatched proof cannot satisfy the proof execution gate. Scientific, sample, acceptance and work-version controls remain independent.
- The original private receipt can be registered as one reported transaction using its actual account, date and bank reference. It remains unverified until authorized review. Stable normalized account/reference identity prevents source replay; conflicting reuse enters the existing A04 financial review. Existing transferred quote advances remain the same transaction.
- Bank import keeps existing CSV and adds the source workbook deposit/withdrawal header mapping. The first worksheet is previewed; explicit import remains necessary. A bank ID, not an inferred invoice number, is the source reference. Reimport ignores mutable description changes; contradictory rows are rejected. This is file import, not a live bank integration.
- `receipts_match_scan` and the existing protected integration tick prepare suggestions and stable A04 reviews only. Retrying an interrupted review enqueue uses the same source key. No proposed match becomes verified automatically. Manual scans record the real authorized actor; token-protected scheduled scans use the existing automation identity.
- Installment plans retain any valid count. Append-only allocation events independently associate multiple verified receipts with one installment or one receipt with multiple installments of the **same invoice**. Reversals require a reason and preserve history. Existing invoices without explicit allocation history retain the labelled legacy oldest-due projection. Once explicit allocation begins, reversing it does not silently revert to legacy allocation.
- Allocation writes atomically guard document/receipt revision, available verified net proceeds, receipt capacity and installment amount. Refunds reduce projected allocated proceeds; they never leave a fake settled balance. Cross-invoice splitting of one transaction is not introduced.
- The first verified invoice receipt creates a durable payment lock; ordinary modification/cancellation remains blocked after refund or void. A narrowly scoped Owner-only `invoice_amend` with `retain_payments: true`, reason and current revision preserves invoice ID, all payments and versions. It cannot change customer/project, scientific line identity/scope/quantity/repetition or execution costs. Allocated installments cannot be removed, renamed, reordered or reduced below allocations; reverse allocations first. Price reductions creating credit require explicit acknowledgment.
- Real bank-backed overpayment requires explicit primary-Owner authorization and reason; normal finance verification still rejects amounts above invoice balance. Credit remains visible and is not silently marked settled. Refunds use the existing journal and authorization path.
- Settlement is an authorized audited event, not deletion or invoice rewrite. It requires exact verified coverage and complete explicit allocations where used. Its version and transaction snapshot invalidate it after cash changes even when the net amount later returns to the same number. Mother and dashboard summaries read the canonical ledger. Financial settlement never closes scientific obligations or grants final result release.

## Access and operation
Finance API access and approval use existing server-side permissions. IT administration alone grants neither. Customer roles keep their own mother-case intake view and permitted financial summary; laboratory sessions receive no financial summary or customer ledger. Changes, proposals, reviews and amendments keep actor/reason/history. Concurrent/stale requests return a conflict and must be reread.

Use `/finance/receipts?id=<document-id>` or `?transaction=<transaction-id>` for an existing case. The page retains the original bank import and transaction forms and adds case filters, receipt/proof review, installment allocation/reversal, follow-up, Owner financial amendment and settlement. Review actions do not imply payment.

## Read-only source validation
The connected Billing Sheet was inspected in bounded ranges: metadata, exact headers and two bank sample rows. Gmail attachment search was read-only. No real records, messages, account details, bank amounts or tokens are included in fixtures or committed source. The bank mapper supports `شماره تراکنش بانک`, `تاریخ شمسی`, `واریز (ریال)`, `برداشت (ریال)`, `شرح و اطلاعات پرداخت`. The wide payment/remaining sheet and emailed proofs remain evidence, not independent confirmed receipts.

Connected ChatGPT tools are not evidence that independent SYNAPSE OAuth or an authoritative bank feed is active. Source completeness and reconciliation of actual accounts remain unverified. No historical import or automatic financial approval was performed.

## Scheduling and activation boundary
Target: daily bank review at 08:00. The UI declares this inactive. Owner must confirm operational timezone, authoritative bank source and a single authorized host schedule for the existing `/api/integrations/tick` token before activation. The displayed provisional timezone is Asia/Dubai; do not assume the host already runs that schedule. Bank-file acquisition is not implemented as a new parallel scheduler. Reminders use existing dashboard/tick mechanics and retain explicit installment allocations.

Before a future joint release: review the branch with Work; take the separately authorized recoverable production backup; deploy only after owner approval; test browser interactions and actual staff sessions using a secure session; verify real financial-source completeness and bank authority separately. Isolated HTTP tests are not proof of live staff login, real bank matching or production data recovery.

## Reproducible verification
Run once after code changes, using installed lockfile dependencies:

```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-finance-runtime.mjs laboratory-targeted-workflow-runtime.mjs
node --test tests/bank-workbook.test.mjs
```

The runtime harness creates temporary Miniflare D1/R2, applies schema there and uses synthetic accounts/sessions and files. No live database is used. FIN-04 covers zero-bank slip handoff with execution preconditions, advance transfer, eight installments, partial/multiple receipts, independent allocations, mismatch, suggestion-only scans, replay/conflict, immutable paid amendment, allocation floor protection, settlement snapshot invalidation, refund, Owner-authorized credit and unauthorized-role denial. Workbook tests include an actual synthetic XLSX and the discovered bank header format with synthetic content. Browser clicks, real staff password login and independent external connections require separate secure acceptance testing.

### Recorded validation — 2026-11-18
TypeScript and production Build succeeded. The isolated FIN-04 suite passed 157 HTTP checks; existing financial suite 113; dashboard suite 60; targeted Work laboratory workflow 44; workbook suite 3 tests, including real synthetic XLSX parsing. Total: 374 HTTP checks plus 3 workbook tests. No browser or real employee-login success is claimed. Production remains unchanged.
