> **IMPORTANT UPDATE 2026-11-24:** Read `docs/unified-intake-current-ui-ticket-task-followup.md` FIRST. It supersedes any prior instructions to redesign the current header, sidebar, intake visual appearance, source tiles, or form entry modes. Use `lib/unified-intake-taxonomy.ts` for the approved central routing matrix. The existing site UI must be preserved; task routing and both intake/ticket workflows require real integration and tests.

# SYNAPSE — Unified Intake, Search, Filters, Routing & Staff Work Handoff
Date: 2026-11-24
Status: APPROVED REQUIREMENTS / IMPLEMENTATION NOT YET EXECUTED
Target repository: 30napse-design/synapse-ai-management
Implementation target: existing SYNAPSE site only; NO publication without explicit user approval.
Branch containing this handoff: feature/unified-intake-filter-routing-handoff-2026-11-24

## Mission
Upgrade the existing **«پذیرش، ارتباطات و پشتیبانی»** to be the single operational entry and retrieval surface for all authorized inbound and outbound interactions. Make search, combined filters, category pills/chips, counts, assignment and staff task routing FUNCTIONAL against actual persisted data—not dummy cards and not browser-only arrays.

**User's last clarification:** «دفتر تماس‌های ورودی» must NO LONGER appear as a separate sidebar submenu. It is fine to remove its visible menu entry, card, or duplicate UI path. It is NOT permission to erase historical calls, records, attachments, audit logs, or database paths. Keep backward compatibility/deep links via safe redirect where feasible. Do not block hiding the duplicate menu merely because full historical-data reconciliation is incomplete; flag any incomplete unified visibility as a blocker to claiming success.

## Reuse existing code; avoid rebuilding modules
Inspect the current main and feature branches, reconcile newer changes and avoid regressing functionality:
- components/operations/operations-intake-form.tsx
- components/operations/ticket-category-selector.tsx
- components/operations/ticket-support-create.tsx
- app/operations/operations-app.tsx
- lib/ticket-support-taxonomy.ts
- lib/operations-intake-ui.ts
- lib/ops-policy.ts
- lib/dispatch-policy.ts
- lib/communication-policy.ts
- lib/org-role-catalog.ts
- lib/organizational-logins.ts
- lib/staff-policy.ts
- lib/work-assignment-policy.ts
- app/api/ticket-support/route.ts
- app/(workspace)/work/[section]/page.tsx
- existing staff tasks, internal correspondence, scientific consultation, labs, projects, and the existing import/sync configuration.
This handoff is the source of truth for NEW user-approved presentation/category/routing decisions, NOT an instruction to destructively replace all legacy persisted category keys.

## First: assess actual state
1. Find sidebar navigation item named «دفتر تماس‌های ورودی» and current «پذیرش، ارتباطات و پشتیبانی» UI and their data/API sources.
2. Run read-only DB aggregate query for ALL accessible records, sources, and phone calls. User reports roughly 1658 intake items and 404 phone calls: do NOT hardcode or assume exact values. Identify source ID, canonical record ID, and duplicate linkage.
3. Check whether the ~404 calls shown in the phone notebook correspond to records in the general intake surface, and whether their visibility differs due to source/category filters. If incomplete, plan a non-destructive query-layer union or indexed read adapter, not an indiscriminate re-import.
4. Verify current sync schedules and Gmail configurations. No new cron or speculative sync frequency. The user has an existing hourly operations sync: reuse its authorized incremental configuration; do not overwrite.
5. Prepare concise before-state and deployment/rollback notes.

## Unified intake UX layout
Use existing shared RTL shell and right sidebar/top bar (no new site). Render:
- One compact prominent unified search bar at top.
- Below: compact filter controls for channel, group, category, dependent topic, owner, and status; reset filters.
- Below: elegant minimal slightly-layered 2D pills / segmented chips (navy, teal, restrained shadows) for channel facets and category facets, with LIVE DB-backed counts. Avoid large flat grids of repeated cards or endless unstructured scroll.
- Below: accessible, virtualized/paginated concise results, ordered newest first. Cards/rows: source icon, researcher/contact, mobile/email, invoice/order if present, group/category/topic, assigned responsible role + actual assignee if known, status, logged time, response due, and open original.
- All chips MUST change underlying server query and displayed results. Selected chips, filter dropdowns and search MUST synchronize and combine; counts must follow clearly documented scope (prefer counts per facet under all other active filters).
- Responsive for desktop/mobile; proper aria labels, keyboard focus, no decorative inert buttons.
- No full page reload for filter changes, no fetching all records to filter locally; server-side pagination/keyset (or appropriate paging), indexed query & debounce.

### Search exact semantics
Search actual persisted normalized fields:
- Persian given name + family name of researcher/contact; normalize Arabic/Persian kaf/ye, whitespace, ZWNJ safely.
- Invoice number, quote number, order number (partial/exact appropriately).
- Iranian mobile (normalize Persian/Arabic digits and +98/0098/0 variants).
- Email (case-insensitive, trimmed).
Combined AND across different filters, sensible OR across matching search fields. Search should not silently omit historical phone calls or Gmail records. Use parameterized DB queries, authorization at DB/API boundary, sane input lengths and page sizes, indexes where supported, stable sort and deterministic pagination. Do not use mocks.

### Source / group / category / topic / assignee / status filters
Source channels: all, incoming phone, outgoing phone, Gmail/email, site ticket, messenger (retain channel detail), in-person, direct internal/site registration; honor actual persisted source vocabulary and map legacy values.
Group (user-facing): «خدمات و پیگیری» [six categories] or «مشاوره تخصصی» [four categories]. Category selection determines available dependent topics. Responsible dropdown shows labels only, NO "1.", "2.", etc.
Statuses: «جدید»، «در حال پیگیری»، «منتظر پاسخ»، «در انتظار تعیین مسئول»، «در انتظار تأیید»، «بسته‌شده» mapped to actual persisted status without rewriting older status records.
Category chips show 6 under service group and 4 under consultation group. Click category -> immediate filtered result set; click phone/email chip -> exact filtered contacts, with OR/AND behavior explicit. Surface live counts from the same canonical query.

## Approved unified taxonomy — route each listed topic
The left column of each pair is the user-facing topic and the right column is the **initial responsible role**. Preserve existing IDs, use a versioned taxonomy mapping and compatible adapters for historical records.

### Group A — خدمات و پیگیری
**A1 درخواست خدمات و سفارش‌ها** — all to «پذیرش و پشتیبانی علمی»
- درخواست خدمات پژوهشی
- ارسال پیش‌فاکتور
- اصلاح پیش‌فاکتور
- مغایرت پیش‌فاکتور
- تحویل نمونه یا مواد پروژه

**A2 پروژه‌های در حال اجرا** — all to «پذیرش و پشتیبانی علمی»
- پیگیری پیشرفت پروژه
- زمان‌بندی اجرای پروژه
- تغییر آزمون سفارش
- پروتکل و روش آزمایش
- سایر موارد

**A3 نتایج و خدمات علمی** — all to «مسئول علمی پروژه»
- زمان تحویل نتایج
- نحوه ارسال نتایج
- بازبینی نتایج ارسالی
- رفع ابهام نتایج
- مستندات تکمیلی
- سایر موارد

**A4 امور مالی و قراردادها**
- پرداخت‌ها و واریزی‌ها => کارشناس حسابداری
- تأیید پرداخت‌ها => مدیر مالی و قراردادها
- اعلام مانده حساب => کارشناس حسابداری
- مغایرت پرداخت‌ها => کارشناس حسابداری
- فاکتور رسمی => مدیر مالی و قراردادها
- مشاوره مالی => مدیر مالی و قراردادها
- سایر موارد => کارشناس حسابداری

**A5 امور داخلی و اداری** — all to «امور اداری و اجرایی»
- امور کارکنان
- انتقاد و پیشنهاد
- درخواست جلسه حضوری
- ارتباط با مدیریت
- استخدام و همکاری
- سایر موارد
("ارتباط با مدیریت" still goes through admin intake; do NOT grant read access to confidential director materials automatically.)

**A6 پشتیبانی فنی و خدمات عمومی**
- ایراد فنی سایت => کارشناس فناوری اطلاعات
- مشکلات فرم سامانه => کارشناس فناوری اطلاعات
- مشکل حساب کاربری => کارشناس فناوری اطلاعات
- اطلاع‌رسانی و تبلیغات => امور اداری و اجرایی
- ساختمان و تأسیسات => امور اداری و اجرایی
- سایر درخواست‌ها => امور اداری و اجرایی

### Group B — مشاوره تخصصی
**B1 مشاوره پیش از سفارش** — all to «مسئول فنی پروژه»
- بررسی ایده پژوهشی
- بررسی پروپوزال
- امکان‌سنجی پروژه
- انتخاب مدل آزمایشگاهی
- انتخاب روش و آزمون
- طراحی گروه‌ها و نمونه‌ها
- بررسی پروتکل

**B2 مشاوره اصلاح سفارش** — all to «مسئول علمی پروژه»
- توضیح خدمات پیش‌فاکتور
- اصلاح روش آزمایش
- تغییر تعداد نمونه‌ها
- افزودن یا حذف آزمون
- تغییر محدوده پروژه
- مغایرت علمی فاکتور

**B3 مشاوره حین اجرا**
- مشاوره پذیرش نمونه => پذیرش و پشتیبانی علمی
- هماهنگی تخصصی آزمایشگاه => مسئول فنی پروژه
- رفع اشکال پروتکل => مسئول فنی پروژه
- تغییر روش اجرا => مسئول فنی پروژه
- مشکلات کیفیت نمونه => مسئول فنی پروژه
- زمان‌بندی علمی پروژه => مسئول فنی پروژه
- بررسی داده‌های اولیه => مسئول فنی پروژه

**B4 مشاوره نتایج و گزارش**
- پیگیری آماده‌شدن نتایج => مسئول علمی پروژه
- بررسی داده‌های خام => مسئول فنی پروژه
- بررسی تصاویر آزمایشگاهی => مسئول فنی پروژه
- بررسی نمودارها => مسئول فنی پروژه
- تفسیر نتایج => مسئول فنی پروژه
- اصلاح گزارش علمی => مسئول فنی پروژه
- بررسی مستندات و پروتکل => مسئول فنی پروژه
- درخواست بازبینی نهایی => مسئول فنی پروژه
("Request final review" is a request topic; actual final approval requires explicit reviewer authorization.)

## Exactly NINE approved display role titles (no numbering in UI)
- رئیس پژوهشکده
- مدیر ارشد پژوهشی
- مسئول فنی پروژه
- مسئول علمی پروژه
- پذیرش و پشتیبانی علمی
- مدیر مالی و قراردادها
- کارشناس حسابداری
- امور اداری و اجرایی
- کارشناس فناوری اطلاعات

Retire user-facing «کارشناس پژوهشی» and «کارشناس پذیرش و پشتیبانی» labels where they were used for this unified intake responsibility; replace with «پذیرش و پشتیبانی علمی». Shorten «مسئول امور اداری و اجرایی» to «امور اداری و اجرایی». DO NOT blindly repurpose the old eight organizational login identifiers: currently there are 8 org roles plus a director, and research-specialist vs customer-manager account permissions are distinct. Treat these nine titles as the approved intake assignment/role vocabulary and design a safe explicit mapping to actual worker accounts / project roles. Where role split/merge or missing role identity occurs, flag it for authorized role configuration; never give a new job title expanded access by title alone. Preserve immutable account IDs, historical assignees, audit trail, and permission checks.

### Oversight
- رئیس پژوهشکده: managerial oversight across all 10 categories, subject to actual server-side permissions.
- مدیر ارشد پژوهشی: can review/record opinion for categories A1, A2, A3, B1, B2, B3, B4. EXCLUDE A4 financial, A5 admin/internal, A6 technical/general. Opinion is not final financial/scientific approval.
- Finance operations and financial approval stay with existing privileged finance flow. Scientific approval requires scientific approval entitlement. No blanket role-based permission expansion.

### Auto-owner and human assignment
When group/category/topic selected, show the corresponding default responsible ROLE immediately and without a number prefix. If the actual assignee is known for the linked project (scientific/technical owner) and authorized, resolve that person as assignee. For unlinked pre-order questions, resolve via an explicit approved role roster or authorized manual dispatch; do not fabricate a project or randomly select staff. If unresolved: «در انتظار تعیین مسئول», with an authorized supervisor triage queue and without creating an assignment to an arbitrary account. Authorized managers can override in UI with audit log (previous/new account, time, actor, reason where supported). Do not overwrite old assignments by reclassifying historical records.

## Intake form validation, retaining complete existing fields
Order: channel, contact details, category group, category, topic, request description, staff response/action, assignee, submit.
- Full name required, Persian-language letters and at least 2 tokens, preserve common Persian names with ZWNJ; enforce client+server; account for pre-existing records containing foreign names by grandfathering historical data / allowing supervisor exception instead of rendering history invalid.
- Iranian mobile required in direct manual form: normalized 09 + 9 digits, allow +98/0098 and Persian/Arabic digits, check realistic prefix and length. DO NOT prevent automatic Gmail/tickets without a phone from entering the inbox; treat missing required contact data as incomplete verification, not loss of intake.
- Email optional; if supplied must have syntactically valid address.
- Invoice/order/quote optional; institution/university/company optional.
- Time recorded server-side automatically (persist UTC, render Tehran locale/timezone appropriately).
- Response due required for a manually assigned case; auto-arrivals can enter triage with pending SLA instead of rejection. Group/category/topic, details, and assignee role mandatory for completed classification; response/action required in staff logging when appropriate, but don't require an invented response to register an automatically received inbound email or ticket.
- Existing communication-specific fields and attachments survive.

## End-to-end task workflow
Single canonical interaction ID with source message IDs, dedup keys, contact, invoice/order, project and ticket links. Gmail, phone, site tickets, messenger, in-person, direct platform intake feed the SAME classification/routing function after permitted ingestion. Do not create duplicate ticket on every sync run, and do not count different views of the same canonical communication twice.
- On accepted intake: identify source, classify only when grounded, assign role, resolve permitted person or leave awaiting assignment, create/update idempotent staff task linked to canonical interaction, due date, source link, context, status and audit trail.
- Every task appears in the assigned person's «کارتابل و برنامه‌ریزی» and authorized supervisor view, never an unauthorized coworker's.
- Bidirectional status handling must be transactionally consistent (or robustly synchronized), with logged transition and no infinite event loops.
- Internal correspondence threads and project/laboratory/scientific hubs link by shared canonical identifiers; avoid independent duplicate tasks for the same correspondence unless explicitly a subtask.
- Workflow: received -> classified/triage -> assigned -> in progress -> response/review -> authorized closure. Distinguish comment/review/final approval.
- Keep current accounts/Gmail OAuth/schedules/staff records and production site unchanged while developing.

## Delivery protocol
1. Implement in NEW isolated code branch derived appropriately from this handoff branch while reconciling newest relevant fixes. Preserve other branches and main.
2. Add unit/integration tests for taxonomy with every topic, category role assignment, senior access exclusions, hidden sidebar link, old legacy aliases, server-side search, combined filters, count consistency, +98 normalization, Persian names, email optional, dedup/idempotency, role assignment, status sync, permission denial.
3. Verify with read-only real DB numbers and authorized browser accounts. For 404 phone vs ~1658 total: report actual verified counts and discrepancies, never claim numbers without queries.
4. Run TypeScript, production build, API regression and desktop/mobile browser flows. Role-specific auth tests must demonstrate no exposure of unauthorized financial/staff/scientific data.
5. Commit and report: file paths, branch, SHA, exact test outcomes, real query/count evidence, any blocker in live DB/session, sync schedule actually observed, rollback plan.
6. STOP. Do NOT publish, mutate live DB, migrate existing rows, schedule new cron, or alter any live connector authorization without explicit management approval.

Owner note: The user's requirement is to stop seeing the separate «دفتر تماس‌های ورودی» submenu, not to delete underlying records. Functional features first, beautiful compact UI second, minimal AI/Work credit consumption throughout.
