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

## Six-domain laboratory center — 2026-11-18

Baseline: published version 53, `59d1b4b2647c9416dc3088b4238876bb4ff9ea75`. Branch: `feature/laboratory-center-2026-11-18`. The three-part reception implementation and its catalog are unchanged.

### Reuse and behavior
- `/laboratories` is the explicit mother-case list; `?view=new` creates an invoice-referenced case with several selected domains. Finance invoices alone never create execution cases. Owner approval creates/replays the existing `laboratory_jobs`, one per department/provider, through `writeMother` and the existing dispatcher. Existing mother cases and provider records remain readable through their existing routes.
- The six UI domains are aliases over existing departments/provider capabilities. No provider, tariff, order, sample or customer table is replaced. The separate case navigation precedes the six-domain navigation. Each domain has seven real tabs.
- The service catalog reads the existing approved tariff snapshot and CSV details. It deliberately removes every monetary field at the server boundary. Missing scientific fields are labeled as missing from the reference. This is not a newly activated live Sheets connector.
- A private attributable receipt continues to trigger financial review. For explicitly management-approved center cases, the receipt can permit execution without requiring a duplicate invoice-file attachment or bank confirmation. This never inserts a confirmed financial transaction. All existing job acceptance and sample-execution guards remain in force.
- Reception items, shipment histories and acceptance decisions retain their IDs. The internal laboratory writer can only send, receive, consume and record per-location storage. Transfers require another job in the same parent project; destination/work-version links are extended on that same inventory item. Physical custody chronology ignores storage-only audit events.
- Scientific dataset drafts append `laboratory_records(kind=result_draft)` on the same job, with an optimistic job revision guard. Files reuse private `laboratory_files`/R2 and existing ACLs. Raw files, images, analysis and technical reports remain classified separately. Submission copies the saved dataset into the existing technical report pathway and preserves the existing execution gates. Prior versions are immutable.
- Inquiries and tickets use existing `ops_items`, `ops_communications`, dispatch tasks and notifications. Recipient selection maps to existing organizational positions, never new roles. Replies retain one request ID/history and do not create another task. Stable source keys protect against replay. Ticket files attach to the existing dispatch task, satisfying the real `staff_work_files.record_id -> staff_records.id` FK; message metadata links each attachment back to its shared conversation. Download authorization is checked against that request, never merely a file ID.
- The existing scientific case engine is reused for a scoped `review_mode=laboratory_consolidation`. All parent jobs must be covered, accepted and ready, with valid sample receipts and signed reports. The coordinator submits one integrated report for one qualified final sign-off; no separate QC/protocol approval is added to this new pathway. Legacy scientific-case checks remain unchanged. A Research Manager without independent final-approval qualification is not granted it: the existing Owner remains the fallback reviewer.

### Validation and limits
- Build: passed. TypeScript: passed. `scripts/test-laboratory-center.mjs`: 69 targeted isolated HTTP checks, plus direct database assertions, using disposable local Miniflare D1/R2 only.
- Covered: explicit two-domain case/approval, repeated dispatch without duplicate jobs, real three-part intake API integration, partial internal custody/transfer with one sample ID, overspend/cross-provider rejection, storage, attributable receipt without bank confirmation, private raw/report files, immutable dataset draft/replay/submission, bidirectional reception/provider tickets, reply notification/replay, actual ticket upload/download and cross-provider denial, management recipient, integrated report submission and one qualified final approval, all six rendered pages/seven tabs, anonymous denial, zero confirmed financial transactions.
- Browser (isolated fixture): sidebar and seven tabs; save draft, reload and recover it; create and reopen shared ticket. No production data was used. Browser-width change was not available through the current browser controls; no physical-mobile verification is claimed.
- Production authenticated write testing remains pending: the available browser reaches `/login` and has no valid staff session. A successful deployment or an isolated role test must not be described as a live employee acceptance test. The two inherited reception checks (authenticated production write and physical-mobile verification) are not marked complete.
- Original user reference images are not available in this execution. The textual approved specification and existing code were used; exact visual equivalence to unavailable images is not claimed.
- Financial invoice auto-fill, an invoice-parser/OCR extension and live Sheets synchronization are not introduced in this change. Direct invoice/customer entry and the existing private mother-document workflow remain usable. Tariff fields absent from the approved source need source maintenance, not invented values.

### Source scope
New: laboratory-center policy/read/write adapter, API and shared-ticket file endpoint, six-domain React workspace/CSS, focused runtime test and harness. Modified: existing laboratory route/navigation, mother unlimited authorized read opt-in, custody metadata chronology/approved-case receipt gate, trusted internal dispatch recipient mapping, saved-dataset report projection, scoped final scientific review. No migration, secret, account or real-data update is part of deployment.

### Owner acceptance after publication
1. Sign in through the existing staff login; open the case list and the six domains.
2. With a clearly marked disposable test case, verify multi-domain dispatch, reload persistence and the same invoice across child jobs. Confirm reception-only decisions cannot be edited through a provider account.
3. Repeat the new internal handoff, dataset/file and shared-ticket flow with the actual intended reception/provider accounts. Check another provider cannot access their records or amounts.
4. Verify the same forms on the institute's actual phones and desktops. Use only explicitly synthetic data; do not alter a real invoice, payment or sample.

## Version 54 stability correction — 2026-11-18

- Baseline verified in Sites: version 54, `1829c09eeb79ca2d826a1ae5b88cfe3b4fd5d6b9`. Correction branch: `fix/laboratory-v54-legacy-notes-2026-11-18`. Not published; requires the owner's publication approval.
- Root cause reproduced on the unchanged version-54 build: `jobDomain()` called `JSON.parse(j.notes)` on historical free-text notes. Synthetic historical jobs made `GET /api/laboratory-center` return 500. The isolated stack identified `SyntaxError` at `lib/laboratory-center-policy.ts:13`. A bounded read of all nine currently returned live laboratory jobs confirmed the same plain-text format, including the animal-domain record. No live row was changed or copied into the repository.
- The native logs available for the reported animal visits returned HTTP 200/outcome `ok`, not a useful JavaScript stack. Example request: `d63c81ff9d948a9379d8fe9d4d33e897`, 2026-11-18T00:50:20.850Z. Digest `3114981963` could not be directly correlated with an exception in those retained logs. A streamed error page can still have HTTP 200; status-only checks are insufficient. The production browser had no valid staff session and redirected to `/login`.
- Fix: one typed `jobMetadata()` adapter accepts actual object metadata, tolerates legacy free text/scalars/null/arrays, validates metadata service arrays and uses the existing job area for domain mapping. All center reads of job metadata reuse it. A valid JSON `null` in a provider's historical notes is also handled in the shared mother-project reader. No conversion or rewrite of stored notes, IDs, parent links, permissions, orders or financial values occurs; no synthetic mother project is created for a legacy job.
- Changed application source: `lib/laboratory-center-policy.ts`, `lib/laboratory-center.ts`, `lib/laboratory-mother.ts`. Test-only additions: focused regression runtime/harness and an opt-in legacy-note fixture in `scripts/package1-preview.mjs`; that fixture only runs in disposable local Miniflare and is not imported by the application.
- Validation: Build and TypeScript passed. The focused runtime passed 38 HTTP/render checks: six domains across Owner/Research Manager/Customer Manager/Research Specialist, free-text and eight unusual JSON note shapes, provider ACL/null-note handling, anonymous rejection and byte-for-byte unchanged historical note/revision reads. Before the correction the same regression failed on its initial 500 response. No production write or database migration was performed.
- Browser validation used the real compiled application against synthetic D1/R2. All six direct routes and sidebar links rendered. The actual content of all 42 tab panels was checked with distinct visible controls/headings, not just clicking a tab or receiving 200. Search/no-match/reset and the work-order dialog were checked in all six domains. Authenticated synthetic Owner, Research Manager, Customer Manager and Research Specialist sessions rendered the animal page and authorized legacy jobs. These are not claimed as real employee production tests.
- The three-part intake page, component, styles, API, writer, catalog and its original runtime tests remain byte-identical to commit `59d1b4b2647c9416dc3088b4238876bb4ff9ea75`. Shared mother-reader changes are limited to safe optional access on parsed historical notes.
- Remaining release conditions: owner approval to publish this correction, then read-only verification using valid production staff sessions. No publication was requested or attempted by this correction. Do not claim the live failure resolved before publication and authenticated verification.


## Targeted follow-up — 2026-11-18

Base: live version 55, `452be915e8f07c55819440ee5f8b78060b000b49`.
Branch: `fix/laboratory-targeted-workflow-2026-11-18`.
Reviewed and applied the four shared UI files from PR #1 (`be4b448a778e73eb00f67317160990dcfb5fa62d`), preserving the existing three-stage intake and all write engines.

- Mother-case action carries the stable project ID into `/sample-intake?id=...`, gated by existing intake permission. Native navigation avoids the observed Vinext Link transition exception; intake return links also use native navigation.
- Job detail identifies current work version, provider, assigned follow-up member, actual signed-in action actor and acceptance history; explicit accept/decline with required decline reason. Read-only readiness is derived from existing finance/mother permits and custody checks. No read operation activates a pre-dispatch order. Unpermitted/zero-quantity pre-dispatch jobs are explicitly labeled and excluded from active-job statistics. Backend enforcement remains unchanged.
- Dataset editor explains missing permission, mother linkage, current-version acceptance, custody, saved/ready report and mandatory report content. Unsaved edits and old versions cannot be silently submitted. Existing result-write gates and idempotency remain authoritative.
- Approved catalog remains the existing tariff snapshot. Six source banks have no columns for sample requirements/output; only EL has a method column. Missing scientific details remain explicit, with source and version, until supplied by an approved scientific source. Fixed EL bank mapping to protein/biochemistry and WB category lookup; no invented metadata or new bank. Live Google Sheets synchronization is not enabled by this change.

Validation: TypeScript and production Build passed. The selected isolated Miniflare run (`node scripts/test-laboratory-center.mjs laboratory-targeted-workflow-runtime.mjs`) passed 44 HTTP checks covering the linked intake case, staged partial/rejected reception, actor/version acceptance, blocked execution without permit, draft/ready validation, documented send and replay, access denial and absence of finance writes. Earlier 69/38-check suites and 42-tab browser sweep were not repeated. Browser fixture verified the direct mother-to-intake link opens the existing three-part form with the same stable mother ID; verified explicit actor/permit reasons and disabled result submit. Production save/send is intentionally not exercised using real data; final publication/read-only browser result is recorded in the delivery archive. No migration, account, secret or production-data change.
