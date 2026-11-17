# Laboratory mother-project completion — 2026-11-17

## Baseline and delivery state
- Published baseline: version 49, code `6aff48d36d4b0856b300aaabb858ed09bb9a435e`.
- GitHub parent: `b1fe5ae12e137d9eb0b83ad82343fcd898fd6975` (includes the baseline publication report).
- Development branch: `feature/laboratory-mother-completion-2026-11-17`.
- This change is development-only: no publication, live migration, account change or operational data mutation.

## Implemented path
The existing `/api/lab-operations` mother view and `staff_records` project remain canonical. `/laboratories` reuses the same component as `/work/lab`; specialty links filter the project list and child work orders. Old internal/external URLs and pre-existing work orders remain available through history links. Internal/external is retained as provider metadata, not a second mother-project engine.

Invoice number is the user-facing reference. Mother details hold the customer, declared invoice dates/amount, department selection, immutable document references, payment declarations and sample/material custody once. Existing `laboratory_jobs` hold child work orders linked by `notes.mother_project`; each preserves service descriptions/quantities and its specialty/provider. Only active providers for the selected specialty can receive a new package. Existing role resolution assigns Research Specialist; no account or role is created.

The project panel offers dashboard, existing approved tariff snapshot, work orders, sample/material custody, results, messages and payment declarations. Services can be selected from the existing approved snapshot or entered manually when unavailable. This is not automatic OCR or automatic approval of a service/rate. Structured invoice-line extraction and automatic specialty splitting remain a separate, unimplemented integration.

## Custody and payment integrity
- No mandatory user-facing sample code. Internal IDs remain stable.
- Samples, medicines, materials and other rows support repeated intake, named/timed dispatch, partial receipt, discrepancy tracking, inter-provider handoff, consumption and per-location stock/pending balances.
- Existing jobs/records/results/files and scientific approval engine are reused. New custody is read as an adapter by existing execution gates, alongside any legacy custody; there is no duplicate inventory per laboratory.
- A positive, attributable uploaded receipt plus the project invoice file and documented Finance routing can permit execution under the owner policy. A payment declaration without its attributable file cannot do so. This never writes a verified accounting transaction. Finance can flag a declaration as needing correction.
- Uploaded invoices/receipts remain private. Provider projections exclude customer contact details, invoices, payments and price values. Result/message evidence uses the existing evidence permission, independently of sample-intake permission.
- Project updates use revision compare-and-swap and transactional history. Stable project/job/item/request identities prevent duplicate creation. Result/message retries use deterministic record IDs. A concurrent stale request may require rereading before retry.

## Validation
Run `npm run build`, `npx tsc --noEmit`, then `node scripts/test-finance-runtime.mjs laboratory-mother-completion-runtime.mjs`.
Result: 91 targeted HTTP checks passed; Build and TypeScript passed. The targeted suite includes the existing mother-path checks and completion checks: three specialty/provider packages under one invoice; synthetic PBKDF2/password login; project and private-file access; unverified-receipt execution; Finance routing without accounting posting; 6+4 tissue intake and three medicines; partial-receipt execution blocking; wrong-provider denial; cross-laboratory custody and balances; progress, result replay and messages. All D1/R2 data and accounts are isolated synthetic fixtures.
Browser preview reached the local login screen only. Authenticated interactive UI and real employee acceptance are NOT verified. No claim of production activation is made.

## Remaining limitations / release steps
1. This branch must be reviewed/integrated with any concurrent Codex work before publication; no merge/publication is performed here.
2. Automatic invoice extraction, live Google Sheets services and external communication are not activated by this change. No paid model or external API is used.
3. Legacy scientific approval and final client-release controls remain authoritative; this delivery does not claim to have retested the complete final-release lifecycle for mother jobs.
4. Mother inventory stores versioned custody in existing project JSON. Future service/order version changes must explicitly reconcile inventory work-version associations; mismatch deliberately blocks execution.
5. New development uses the existing schema and storage bindings; no new migration or secret is required. Deployment still depends on the existing D1/R2 runtime configuration.

## Changed files
- `app/(workspace)/laboratories/page.tsx`
- `app/(workspace)/work/[section]/page.tsx`
- `components/laboratory/laboratory-mother-workspace.tsx`
- `components/laboratory/mother-execution-panel.tsx`
- `lib/laboratory-mother.ts`
- `lib/mother-workflow.ts`
- `lib/mother-custody.ts`
- `lib/lab-execution-write.ts`
- `lib/sample-custody.ts`
- `lib/navigation.ts`
- `tests/laboratory-mother-completion-runtime.mjs`
- this document
