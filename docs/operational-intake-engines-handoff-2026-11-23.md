# SYNAPSE — operational morning readiness handoff
Repository: `30napse-design/synapse-ai-management`
Branch: `fix/operational-intake-engines-2026-11-23`
Base: `test/sample-intake-header-operations-hostinger-2026-11-23`

## Owner's requirements — implement, test and report; DO NOT publish without explicit permission
This branch consolidates **three engines** without cross-migrating customer data:
1. Reception / customer communication (`/operations` and `/operations?source=incoming`)
2. Researcher sample receipt and destination laboratory custody (`/sample-intake`)
3. Work planning, assigned work and projects (`/staff?view=dashboard`, existing `/laboratories`)

## Reception
- `components/operations/operations-intake-form.tsx` is the approved single user-facing entry for inbound calls, outbound calls, email, visits and messaging. Mode list is configured in `lib/operations-intake-ui.ts`. **No separate top access scope dropdown or extra request-type/customer-kind/ticket-kind data fields** in the main admission modal.
- Main category `دسته اصلی` + dependent `موضوع درخواست`: exact same final approved `siteTicketCategories` from `lib/ticket-support-taxonomy.ts` used by site tickets. Changing category MUST reset selected topic; topics not authorized by old workflow subtype must remain disabled until mapped properly, never silently remap to unrelated category.
- We fixed critical **real SQL** problem in `lib/operations-data.ts`: recorded `source_body` is saved as `دسته اصلی: ...\nموضوع درخواست: ...\n\n... ` while previous query compared against the very FIRST line `موضوع درخواست`; thus new entries failed the category-dependent topic filter. It now searches an exact newline-delimited topic line via `instr(char(10)||source_body,...)`, with a legacy subtype fallback for old entries. Test this with new records from multiple categories and retain matching old records.
- `app/operations/operations-app.tsx`: outbound and in-person previously switched to a large, old heterogeneous form, now route to the same approved `OperationsIntakeForm`. The dangerous/confusing manual bulk assignment panel and its list checkboxes are suppressed in the routine intake UI; backend action is preserved for explicit managerial workflows. If user later needs batch assignment, design a separate explicit manager-only screen with confirmation and audit. Do NOT delete records or modify assignment automatically.
- Ticket category selector: when a category is chosen while the source isn't selected, select site source and dependent topics consistently. Staff owner dropdown now displays organizational role rather than repeated private names. This is a presentation change; existing account IDs and RBAC preserved.
- Keep `ثبت ارتباط ورودی` (blue, manual) and `ورودی تماس تلفنی` (green, phone event placeholder) distinct. **Do not claim telephony integration is live:** original on-screen guidance explicitly states automatic line-to-CRM is NOT active.
- A label/filter `بایگانی‌شده` in other pages must be investigated before removal. In the current main operations list, the visible checkbox was the manager's batch-selection control, NOT an archive/delete action. Archive or deleted historic records must never be changed as part of this UI cleanup.

## Independent sample intake
- Before correction, `/sample-intake` was bound to existing mother cases and invoices; this was blocking new researcher samples when no invoice yet exists.
- Reused previously authored separate branch `test/standalone-sample-intake-2026-11-23` **without inventing a new database model**, via the existing `staff_records` + `staff_work_details` schema and a scoped `kind='sample_intake'` record:
  - `lib/standalone-sample-intake.ts`
  - `components/laboratory/independent-sample-intake.tsx` and CSS
  - `app/api/sample-intake/independent/route.ts`
  - `tests/standalone-sample-intake.test.mjs`.
- `app/(workspace)/sample-intake/page.tsx` now defaults to independent reception; the old linked-to-invoice workflow remains preserved as opt-in `?legacy=1` or `?id=`, collapsed.
- Steps: (1) required researcher name and project title, optional phone/email/organization and notes; no invoice or mother case; (2) register each sample (name, type/category, amount, unit, treatment, storage, transport, preparation, supplier), persist immediately and list below; (3) receive physical sample with quantity, condition, delivery details; (4) manager/scientific/technical coordinator selects **real active destination laboratory**, sends; (5) only destination laboratory's authorized account can confirm its own received quantity; discrepancy stored separately, immutable history and revision-based writes.
- **Do not equate administrative sample sheet with scientific project approval or billable lab order.** No auto-invoicing. No unauthorized lab permissions. The lab acceptance state must be checked with a real test laboratory login before employee launch.
- Keep approved existing mother case and older 203 AN/102 HP catalogs intact.

## Work engine
- Reused `components/workspace/work-command-dashboard.tsx` + CSS and real correspondence strip from existing approved pixel-reference branch, but NOT its divergent shell/header CSS.
- Updated `app/staff/work-app.tsx` so the default /staff dashboard presents the compact consolidated work board. Old detail dialog, task creation and workflow actions remain. Updated `lib/navigation.ts` to show exactly: برنامه‌ریزی، کارتابل وظایف، بررسی و تأیید، مکاتبات داخلی; older /staff?view=overview/all/board routes still work.
- `readStaffData` already calls `reconcileDispatch` and `sweepDispatch`, filters authorized real records, and exposes existing staff members. The frontend shows up to 50 real tasks with no generated samples. **Verify** new reception assignment flows actually project to the selected staff account without duplicate task and without exposing confidential records; assignment may require manager approval in dispatch routing.
- Do not treat raw Gmail or call count as all work tasks; old unassigned items stay in management allocation queue. No random assignment.

## Automated synchronization — verified current connector data
- The connected SYNAPSE plugin confirms controlled source labels and incoming-call Sheet; owner-authorized scheduled task has bounded import rules (max five new source messages per run, two-day overlap, preserve sourceKey, human assignee, status and due).
- Last persisted-status read showed 1098 operations and 525 tickets and recent runs only through 2026-11-22T15:23Z. This is **not** proof that Hostinger owns an independent live automation. Config has `automatic_api_oauth:false` for the mailboxes; outbound is disabled. Do not turn on connectors/cron or import old messages without explicit separate owner authorization.
- No source Gmail mutation and no mass initial backfill; source upserts only with verified IDs and correct per-mailbox prefixes.

## Mandatory staging integration / QA
1. Compare branch to the ACTUAL deployed Hostinger source and other reconciliation branches; choose file-scoped fixes to avoid stomping newer unrelated changes. Do not overwrite existing production schema.
2. Run TypeScript, Build, `node --test tests/operational-intake-engines-integration.test.mjs tests/standalone-sample-intake.test.mjs tests/operations-intake-ui.test.mjs tests/sample-intake-ux-regression.test.mjs`, and existing dispatch + roles + tickets + operation filters tests. Fix all failures and report actual execution logs.
3. Test on staging with two or more real authorized organizational accounts:
   - manual reception inbound / outbound / visit, category A/topic A1 -> persist -> read back, then category B/topic B2 -> read back; filters must distinguish without historic alteration.
   - no bulk assignment checkboxes clutter on daily intake; manager-only actions still available via secure API but MUST NOT silently execute.
   - new sample researcher without invoice -> add two types/amounts -> reload and verify immediately below -> physical receive -> authorized send to one real active lab -> destination lab login reads only own sample -> confirms quantity -> original sample receipt history remains; mismatched quantity recorded as discrepancy.
   - manager assigns task to one organizational member -> member login sees same ID in own dashboard -> one task detail, attachments, history. Unauthorized accounts cannot view.
   - desktop/mobile including color, subject-dependent menus and compact dialogs.
4. Check runtime DB semantics of `db().batch` and SQL `changes()` for standalone intake; require actual mutation/readback on staging before considering complete.
5. Compare visual workboard with approved image separately; this branch intentionally preserves Hostinger shared shell rather than overwriting it. Don't falsely claim pixel-perfect global header.
6. Only after tests, present screenshots, commit list and blockers. **DO NOT** merge to main, deploy to Hostinger, publish, change live records, run a historical migration, or activate independent Gmail OAuth/cron without explicit approval. Minimize Work credits and avoid duplicated agent runs.

## Known limitations
Source commits exist in GitHub, but this conversational GitHub tool did NOT run a local TypeScript build, browser screenshots, authenticated staff workflows, or live DB writes. Completion requires the staging QA above. If errors are found, do not claim tomorrow's staff launch is ready until validated.
