# SYNAPSE phase-2 correction — KEEP CURRENT UI, unify actual dispatch and task surfaces
Status: user-approved follow-up 2026-11-24. Read THIS together with docs/unified-intake-filter-routing-agent-handoff.md. THIS document overrides any contradictory layout/form/modal instruction in the earlier handoff.

## Verified code findings (read actual source, not imagined mockups)
- The current `app/operations/operations-app.tsx` already renders `communication-channels`, `OperationsStaffFilters`, the 9 responsibility group shortcuts, ticket-specific filters, `TicketSupportCreate`, `OperationsIntakeForm`, and the actual data list.
- The current `components/operations/operations-intake-form.tsx` is a working modal form with existing custom fields.
- The current `components/operations/ticket-category-selector.tsx` uses old seven-site/four-direct categories; `lib/ticket-support-policy.ts` validates those old categories, `app/api/ticket-support/route.ts` sends records to `dispatchCreate`.
- The existing `lib/dispatch-engine.ts` creates linked staff tasks in `staff_records` and `staff_work_details`, using workflow positions, with important access controls and dedupe. But current heuristic `classifyCommunication` does NOT enforce all the new topic-to-role decisions.
- Existing staff title mapping uses eight old organizational accounts plus director; the newly approved nine intake responsibility labels have missing or split account mappings. Never pretend role label alone defines a concrete permitted assignee.
- Source file `lib/unified-intake-taxonomy.ts` now contains all 10 approved groups, topics, default responsibility role keys and senior scientific review scope. Use this source, not duplicate hardcoded lists.

## ABSOLUTE: NO REDESIGN of existing shared site shell or intake screen
Keep present SYNAPSE header (including actual signed-in name and AI actions), existing right sidebar, current color, spacing, buttons, layout and form visual style. Keep all nine existing source/entry shortcuts in their existing position beneath heading; preserve their exact channels and styling. **Do NOT rebuild UI from previous ChatGPT wireframes**. Only add minimal controls within existing layout as required for reliable search/routing.

- Maintain one MANUAL entry path via «ثبت ارتباط ورودی»; source channel icons filter data, they are NOT alternative manual-entry forms.
- «ثبت تماس ورودی» automatic-phone button remains visible but DISABLED until real telephone/VoIP integration is verified/authorized. Do not enable via a generic `canCall` permission alone; detect actual integration state server-side.
- Remove the redundant large explanation/guide box about "همه ارتباطات ورودی ...", not the existing channel shortcuts.
- Intake and ticket registration form should be available inline/open below filters on respective views, retaining the current screenshot style and all existing inputs, validity and attachments. User expects no prerequisite modal click for first entry; after successful submit reset safely for next entry. If it needs an explicit toggle for post-submit collapse, keep single manual-entry action, not duplicate.
- The new user-facing field sequence: type, contact details, group (6 services / 4 consultation), category, dependent topic, description, staff response/action, automatically recommended role and optional authorized assignment.
- The form `onSubmit` must validate on client and server; Persian full name, normalized Iranian cellphone (manual phone channel), optional but valid email, optional invoice/order and optional organization. For external Gmail/tickets without phone, ingest without fabricated phone (triage for incomplete contact).
- On category/topic change set the suggested RESPONSIBILITY immediately. Keep explicit separation: role suggestion vs actual assignee account; if missing eligible assignee show «در انتظار تعیین مسئول» and queue authorized triage. NEVER automatically pick owner account as fallback merely because it exists.
- Only one place to configure approved responsibility taxonomy: `lib/unified-intake-taxonomy.ts`.

## Filters and results across BOTH views (same reusable component)
A. «پذیرش، ارتباطات و پشتیبانی»: current channel icons are maintained; unified server-side search (name, invoice/order, phone, email), group, category, topic, owner, status, reset. Filter source via existing channel icons. Results BELOW inline form with quick category chips and matching real items.
B. «تیکت و پشتیبانی»: preserve the existing site-vs-direct source switch («تیکت‌های سایت» / «ثبت مستقیم سامانه») and existing ticket dashboard. Show same search/group/category/topic/owner/status/reset filters, but DO NOT display phone and in-person channel selectors here. Ticket form always open inline after filters, with same two group choices, 10-category taxonomy, dependent topics and auto-recommended responsibility; results below, matching filters. Do not replace existing public submissions or assume site form is already connected automatically.
C. The category chips must match the view's group and ONLY filter the persisted server query. All counts must be real, no fabricated samples. Keep current shortcuts and filters' existing CSS as much as possible.
D. Existing tickets' taxonomy metadata v1/old labels remain readable/searchable. Version NEW ticket metadata (e.g., ticket_v=2), accepting legacy v1 for old rows and replay. User should not see duplicate ticket records.
E. Hide «دفتر تماس‌های ورودی» as a separate sidebar item. Its historical records remain queryable from unified intake by phone filter; deep-link redirect if safe.

## Routing: critical, required IMPLEMENTATION, not mere documentation
- In `app/api/ticket-support/route.ts`, validate source/group/category/topic against central approved catalog server-side; do not trust client-submitted role/assignee.
- In operations intake API path and all existing authorized ingestion channels (Gmail, site tickets, manually entered phone/messages), compute responsibility with `intakeDefaultResponsibility(categoryId,topic)` ONLY when the classification is confidently sourced. For unclassified historical email/phone, keep «در انتظار طبقه‌بندی/تعیین مسئول», never silently infer sensitive authority.
- Integrate routing into existing `dispatch-engine.ts` so `ops_items.routing` and linked `staff_records` task(s) are created/updated idempotently using existing transaction/dedupe and permissions. Do not create a parallel task store. Use project-specific responsible person where assigned; otherwise lookup an authorized active account-to-role mapping or leave awaiting assignment. Existing `position()` fallback to owner MUST NOT be interpreted as a valid owner for absent roles; fix or guard missing mapping only within this workflow, without altering historical tasks.
- When managers manually choose a permitted employee, persist actor, old/new target, reason, timestamp and sync visible task ownership; do not edit unrelated staff accounts.
- The record must show in the assigned user's «کارتابل و برنامه‌ریزی» AND their personal homepage/dashboard (role-filtered task summary with link to same item). Avoid duplicate tasks; reuse the same `staff_records` ID. Preserve manager visibility and science oversights without opening finance/admin/IT data.
- Personal staff task page: unobtrusive «حوزه‌های مسئولیت من» section showing category + topics linked to the actual mapped role(s). This is a read-only explanation, not permission source, and should NOT replace existing task controls.
- Scientific/technical project roles must be resolved per actual project when possible. The director can oversee all categories according to permissions; senior researcher can review only A1,A2,A3,B1,B2,B3,B4, never finance/internal/IT categories. Review notes ≠ final approval.
- Internal correspondence, lab, scientific and project links use the same request/project/assignee IDs. Sample intake/laboratory workflow remains unchanged until separately specified by the user.

## Critical end-to-end acceptance scenarios
1. User opens existing operations screen: same main site header, name, AI controls, sidebar and colored channel icons; redundant guide box absent.
2. Automatic call button disabled before actual phone integration; only `ثبت ارتباط ورودی` is live/manual. No competing manual phone path.
3. Intake inline form already visible below unified filters. Selecting consultation + category + topic updates responsibility label without pressing another button.
4. In ticket view, site/direct switch, same group/category/topic/owner/status filters and always-open ticket form visible; no phone source filter. User can filter actual tickets and see matching results below.
5. Ticket and intake created from same approved topic route to SAME role-resolution logic; actual assignee receives exactly one linked task in «کارتابل و برنامه‌ریزی» and personal home.
6. Unknown employee mapping -> visible «در انتظار تعیین مسئول» in a privileged triage queue, no random assignment.
7. Search/filter loads server data, including legacy Gmail/phone and old tickets; no fabricated counts.
8. Director oversight all, senior research oversight exactly 7 non-finance/non-admin/non-IT groups; a normal colleague cannot read another's sensitive ticket/task.
9. TypeScript, production Build, route/API integration, form tests, mobile/desktop browser tests, historical-v1 compatibility and automatic incremental sync idempotency all pass before deployment.
10. Do not modify original main/live production, no destructive data changes. Commit to isolated development branch; report actual test results and blockers, then STOP. Never publish without explicit user approval.

Keep AI/Work credit use minimal; do not invoke AI for each incoming contact when deterministic category/topic is already selected.
