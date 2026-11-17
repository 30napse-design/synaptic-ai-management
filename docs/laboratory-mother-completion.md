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

## Researcher sample reception — 2026-11-18

- Baseline code: published v52 `132aee77ff624fb4ceb12368fc362ae993c730d5`; its verified publication-only GitHub follow-up `f855d5aa29d22c50b4aca88c5d0e8a812edba33a` is retained as the parent. Work branch: `feature/researcher-sample-intake-2026-11-18`.
- Entry: `/sample-intake`, linked in the staff cartable and the mother-project Samples tab. Three sections preserve the approved field/option order: item specification, shipment declaration and physical receipt, expert acceptance/referral. Shared WorkspaceShell/header is retained. Responsive local CSS uses a single column below 640px; native dropdowns remain keyboard accessible.
- References actually read: C07 HTML `11WJZdesfub2nTmXozmQcIMK8onoSt8zm`, plus IMG_9929, IMG_9931, IMG_9933, IMG_9935 and IMG_9936–9942 screenshots (11 accessible files; overlapping material). The raw-acceptance Drive folder `1pn5BU6rX8OcwMKCVkNwhUTTQd6qWi1Zj` returned no children. It is not claimed to have supplied a complete original form. C07 is an offline demo, not an operational backend. Animal species (rat/mouse/rabbit/other) and existing medium/urine terms come from its code; named medicine types/temperature menus are not invented. Exact medicine identity and approved transport conditions are recorded as text. Explicit current owner instructions take precedence where older screenshot labels differ.
- No schema/migration, secret, account, financial approval or tariff modification. Items remain in `details.mother.inventory`; shipment references and private file metadata extend that same mother JSON. No second sample inventory or copied invoice/customer is created. Reception items link to an existing work-order service row and version, its agreed quantity, provider and one of the six approved destination groups. Existing eight specialty/provider records remain untouched; six intake domains map to them.
- Declaring a shipment does not increment physical receipts. Each actual receipt records timestamp, source person, authenticated reception officer, appearance and discrepancy. Received stock is held in `quarantine` until the reception decision releases the accepted quantity to institute stock. Partial and rejected amounts cannot be dispatched by the existing custody engine. Multiple receipts after a reviewed partial batch preserve previous decisions. Explicit supplementary/replacement decisions release only the rejected quantity for a replacement shipment; original receipts/history remain intact.
- Labs see the same sample IDs, permitted item details, receipts/acceptance history and their own internal stock. They may use existing send/receive/consume/storage custody operations, but cannot call reception writes, rewrite customer delivery methods or acceptance decisions, or bypass the reception route with a legacy intake mutation. Invoice, tariff and payment data remain excluded from provider projection.
- PDF/image files are size/type/signature checked, private R2 objects, scoped to the mother/item/shipment, hash-deduplicated and retrieved through authorization. No credentials, object paths or private file bytes are returned in collection metadata. Initial registration and decision history use the existing transactional revision guard; repeat keys reject changed content.
- Scientific-decision cases route through existing dispatcher family A11 to the assigned Scientific Manager and its existing task/notification path. No scientific approval is granted by reception. A failed routing attempt remains explicitly pending and has a stable retry action; retry does not create duplicate tasks or reapply stock changes.
- Validation: TypeScript and production Build passed; 102 isolated compiled HTTP checks passed for dependency validation, approved quantities, staged/multiple/replacement shipments, partial acceptance, rejection/quarantine, private file access/signature/replay, provider separation, scientific referral/retry/task deduplication, and persistence after logout/fresh provider password login. No previous full-system suites were rerun. Native browser QA with synthetic accounts verified the staff menu, dependent type/destination controls, item creation, shipment creation, partial physical receipt, partial acceptance and stored/read-back history. A production employee write test and physical mobile-device test are not attested without a valid employee session/device; source/preview tests are not described as production acceptance.

Changed files: `app/(workspace)/sample-intake/page.tsx`, `app/api/sample-intake/route.ts`, `components/laboratory/researcher-sample-intake.tsx`, `components/laboratory/researcher-sample-intake.module.css`, `components/laboratory/mother-execution-panel.tsx`, `lib/sample-intake-catalog.ts`, `lib/researcher-sample-intake.ts`, `lib/mother-workflow.ts`, `lib/navigation.ts`, `scripts/package1-preview.mjs`, `tests/researcher-sample-intake-runtime.mjs`, and this document. The preview fixture extension is opt-in, isolated and never imported into the application worker.
