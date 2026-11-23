# SYNAPSE — مرکز مشاوره علمی چهارگانه (Staff-only) — Handoff

**Branch** `feature/science-consultation-four-hubs-2026-11-23`, based on `feature/unified-work-command-center-2026-11-23`.
**Live URL to inspect, not overwrite by default:** https://visionofresearch.co/work/science

## Four desks at the top — not a customer intake form
1. پیش از اجرای پروژه: idea, proposal, methodology, feasibility; current case / referral / consultation / design tools
2. پس از برآورد و فاکتور: technical questions, adjusting services and study design; same versioned case and opinion log
3. حین اجرای پژوهش: protocol, lab results, QC and deviation workflows; same existing science/lab policy
4. نتایج و مستندات: raw instrument data, microscopy, charts, protocols, analysis, report, review; existing private file and HTTPS URL APIs

Exactly four prominent, minimal, accessible clickable tiles in one row on desktop, responsive on mobile. The old seven technical operations survive as secondary contextual tabs. Four old metric tiles are removed **only from the science screen** (their underlying data is unchanged).

## Real actions and staff responsibilities
- Manager selects a *real active scientific member* for the specific desk on an existing science case; `phase_assign` uses server-side manager/assignment checks and atomic database batch.
- The selection persists to that science case's `payload.phaseOwners`; links the authorized member as case collaborator and creates or updates an idempotently keyed `staff_records` task. `/work/science?case=<id>&desk=<phase>` opens the correct desk.
- Previous collaborators are retained (do not silently revoke a separate pre-existing collaboration). If access removal is required for reassignment, perform a separate explicit rights audit.
- The original full seven-step science case and review workflow are not duplicated; existing `/api/science` and `/api/science/files` remain authoritative.
- File upload: real `/api/science/files` with authenticated write, per-case private object storage (25 MB per file). After upload, user selects type (raw/device, microscope image, chart, protocol, analysis, other) and enters provenance summary to record a versioned `data_create` entry. Report-specific upload is saved through the original report registration; the file is not an approved scientific report until workflow validation and independent approval.
- HTTPS links support external references such as Google Scholar, Drive, instrument archive; **link registration does not sync or import the remote contents**. Do not promise a Google Scholar storage integration.
- Scientific intake referrrals are now read from legacy `results`, `customers`, `projects` **only** when a conservative scientific subject/family matches, then filtered by existing `canSeeOps`; financial and unrelated intake stay excluded. Same predicate gates linking to a case in server writes; never change legacy categories or assign old records automatically.
- No fake information or automatic acceptance of scientific results.

## Acceptance gates (Work agent)
1. Pull and compare with newest GitHub and installed live release; preserve all newer operational/finance/permission changes.
2. TypeScript / Node tests / production Build. Staging tests with real authorized users:
   - Manager opens a real existing case and assigns **different** employees to all four desks; after reload, each respective staff account sees the correct task and linked desk; ordinary staff cannot reassign.
   - Open each tile, navigate its contextual tools without losing edits; check one-page RTL desktop and mobile.
   - Authorized result worker uploads a small approved test file and **completes the metadata dialog**; after refresh/download it must be linked to the selected science case and visible to authorized staff only. Repeat with HTTPS link, chart, protocol, and a versioned report.
   - Verify wrong account cannot see file, edit another scientific case, read hidden contact data, or approve another user's report. Check new/legacy relevant intake sources show and links are not duplicated.
   - Test missing object store (BUCKET) shows clear error and still permits external HTTPS link as fallback.
3. No deleting, rewriting, or migrating original records, Gmail sync, task status, invoice, staff roles or payments.
4. Backup / reversible staged deployment; **do not publish to visionofresearch.co without owner's explicit permission**. Report current head SHA, CI, authenticated smoke and blockers.

## Original modules preserved
`components/science/science-workspace.tsx`, `lib/science-policy.ts`, `lib/science-write.ts`, `lib/science-data.ts`, `app/api/science/files/route.ts`, staff work desk, labs, operations and financial API. No new production database tables.
