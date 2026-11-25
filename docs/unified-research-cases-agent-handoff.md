# SYNAPSE — unified research cases and project management
## Agent handoff | 2026-11-23 | Do not publish without approval

### Source and scope
Repository: `30napse-design/synapse-ai-management`
Branch: `feature/unified-research-cases-2026-11-23`
Base: `feature/sidebar-consultation-projects-2026-11-23`; this branch includes the previously approved navigation regrouping.
Design basis: 13 user-approved mobile screenshots in the ChatGPT project discussion. Screenshots are visual references, not proof that the production UI has been migrated.

### Non-negotiable acceptance
The sidebar group is **مشاوره علمی و مدیریت پروژه‌ها**, children in order:
1. **ثبت پرونده و مدیریت پروژه**
2. **مرکز مشاوره علمی**
3. **مشتریان**

Existing `/laboratories` is the consolidated **management of research cases and projects** listing. Keep the heading **مدیریت یکپارچه پرونده‌ها و پروژه‌ها**, top-level **ثبت پرونده جدید** action, full existing advanced filters and real-case table. Six two-column mobile case grouping buttons, in this order: کل پرونده‌ها / آماده‌سازی یا شروع‌نشده / در حال اجرا / متوقف یا دارای مانع / در آستانه اتمام / اتمام‌یافته.

The original case-create form **must** be reused at `/laboratories?view=new`. Keep invoice number, researcher identity and contact data, institution, case title, project description and notes. New project metadata: kind (research/lab services/industrial/thesis), priority (normal/high/urgent), ONE responsibility-type select with precisely five allowed titles (senior research project manager, institute technical head, project scientific lead, research specialist, relevant lab manager); THEN select a real authorized staff member; ONE final approver category with precisely two choices (institute management / senior research project manager); execution status exactly eight options without 'waiting to assign executor'; blocker reason exactly eight options including separate unpaid and below-threshold payment. Preserve separate per-lab authorized executor, due date, notes, existing service selector and tariff catalog. Do not rewrite AN/HP/WB/EL services.

At bottom keep dates, open summary, draft, submission for approval, and management-only direct approval. Saving a draft must remain visible to authorized record owners; approval server authorization must remain authoritative. Existing sample intake `/sample-intake`, internal letters `/work/mail`, and all legacy routes must remain reachable.

### Implemented on this branch
- Prior sidebar branch included, with mail moved to work planning and duplicate new-case sidebar shortcut removed.
- `lib/research-case-metadata.ts`: controlled choices, normalization/validation, list bucket mapping.
- `components/laboratory/laboratory-center.tsx`: case listing grouping, improved search label, project fields and open summary; existing lab service selection retained.
- `components/laboratory/laboratory-center.module.css`: responsive case shortcut design and section styling.
- `lib/laboratory-center.ts`: existing mother-case create path persists `research_project` metadata, read path returns it; selects active staff and validates selected person.
- `lib/laboratory-case-workflow.ts`: draft create/update and finalize persist validated metadata.
- `tests/research-case-metadata.test.mjs`: field option and state-mapping tests.

### Must validate before any merge/implementation
1. Run `node --test tests/navigation.test.mjs tests/research-case-metadata.test.mjs`, `pnpm exec tsc --noEmit`, and `pnpm build` on an appropriate supported runtime. Log results; none are claimed as passed solely from GitHub commits.
2. Verify there is no mismatch between the historical `centerCaseState` statuses and display-only six-bucket group function, particularly paused cases, pending samples, draft and archived data.
3. Verify one mother case per invoice, draft save and finalize, authorized staff resolution, manager approval permissions, old rows without `research_project` metadata, case read filters, responsive desktop/mobile.
4. Confirm review/approval category does not grant permissions on its own. Actual approval is still locked to existing manager authorization; delegation to senior projects manager is **not implemented** and requires explicit RBAC approval.
5. Verify that case metadata remains persisted across editing existing finalized cases, status changes and migrations; no new parallel tables or destructive schema changes are authorized. If editing existing cases needs additional persistence, implement narrowly with access checks and event history.
6. The existing `centerCaseState` remains operational source of truth: saved `execution_status` must not silently replace actual lab/job states. Plan a reconciled state machine only after documenting compatibility.
7. Confirm the `مشتریان` link destination is appropriate: current navigation points to existing `/operations?view=history` and does not create a new CRM.
8. Be careful with Hostinger migrations; this feature branch is based on the source default-branch architecture, not necessarily on the independent Hostinger Next.js/PostgreSQL adaptation. Compare and port these changes surgically; do not wholesale merge an incompatible runtime.

### No-change boundaries
No edits or writes to `main`, active Hostinger branch, deployed SYNAPSE site, current client records, invoices, tariffs, result files, approved reports, or sample histories. Do not automatically publish or merge.

### Agent output
Report each commit, changed files, compile/test outcomes, any blockers and migration differences. STOP for management approval before merging/deploying. Minimize Work credits: inspect only impacted files, run targeted tests first, then one production build.
