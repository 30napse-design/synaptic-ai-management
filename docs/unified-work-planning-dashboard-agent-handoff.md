# SYNAPSE — Unified Work & Planning Dashboard
Implementation branch: `feature/unified-work-planning-dashboard-2026-11-23`
Base: `feature/ticket-compact-workdesk-2026-11-23`
Repository: `30napse-design/synapse-ai-management`

## Owner-approved layout, exact visual direction
Implement the approved one-screen Persian RTL dashboard with a left-side calendar, central work board, four rich pastel cards, six narrow KPI controls, and a real correspondence strip. Match the approved mockup's color system closely (blue / turquoise / green / amber / purple), low card heights, rounded corners and navy type. Desktop and mobile. The screenshot is a **visual reference only**; its illustrative counts and ticket names MUST NOT be used as live data.

New sidebar group has **exactly four items in this order**:
1. برنامه‌ریزی `/staff?view=plans` — date navigation and planning, including today's and future plans
2. کارتابل وظایف `/staff?view=dashboard` — consolidated overview, today, all tasks, board, and assigned tickets
3. بررسی و تأیید `/staff?view=approvals` — pending review, submitted and decision history
4. مکاتبات داخلی `/work/mail` — receive, send, wait, history and files.

Keep old `/staff?view=overview`, `view=all`, `view=board` working for legacy deep-links and existing API consumers. Do not delete their records or actual APIs. Do not duplicate the underlying task database.

## Statistics contract
Six KPIs are derived from real `staff_records` returned by existing `readStaffData` and filtered through `isWork` and `participant` / existing authorized visibility:
- همه وظایف: all real authorized tasks assigned to or collaborated by this user, inclusive of completed history
- جدید: status `todo`
- امروز: `executionDay(r)===today`
- منتظر اقدام: statuses `blocked`, `review` or `changes` (not the same as all unanswered communications)
- موعد گذشته: unfinished tasks whose due/scheduled date has passed, via `isOverdue`
- بدون مسئول: real rows missing `assignee`, shown **only** for authorized management.

Counts overlap and must **not** be summed together. Selecting a card must update the filtered task list in the same dashboard. Use the **latest 50 actual permitted tasks** as the initial displayed list, ordered by recorded update timestamps. Never invent tasks, randomly fill categories or assign historical items just to populate cards. Do not include all raw Gmail messages as 'tasks'.

Existing dispatch reconciliation runs in `readStaffData`; only already-linked real tasks should be shown to their authorized assignees, from the proper real nine-role org accounts. No automated bulk reassignment of 1000+ old Gmail/call entries.

## Current implementation
- `components/workspace/work-command-dashboard.tsx`: unified colorful navigation, KPI cards, left weekly Persian calendar, small 4-column Kanban, last 50 permitted task list, filtered subviews for planning and approvals, organizational duties panel.
- `components/workspace/work-command-dashboard.css`: responsive matching palette.
- `components/workspace/work-correspondence-strip.tsx` & CSS: recent 7 authorized original internal tickets/correspondence (the current `/api/internal-tickets` already scopes the records), with received/sent/waiting filter; original content, attachments, response actions remain in existing internal-mail workspace.
- `app/staff/work-app.tsx`: dashboard view mounted; old views, task form and detail dialog, evidence/files, comments and approval remain.
- `lib/navigation.ts`: four work items in new order, old route handling preserved.
- `tests/unified-work-dashboard.test.mjs`: static regression checks.

## Functional QA before using this with staff
1. Compare actual current site branch with the implementation branch, especially recently changed sidebar, ticket, sample intake and Hostinger runtime. Cherry-pick **only scoped work dashboard changes**; do not overwrite unrelated production work.
2. Run TypeScript, production Build, node tests and HTTP. Run `node --test tests/unified-work-dashboard.test.mjs` plus work, staff, dispatch, internal ticket, policy, and navigation regression tests.
3. Verify the real role/account mapping and RBAC (one management + organizational accounts): no personal-name-only duplicated options. Roles/labels don't grant privileges. There is a known role/catalog difference between staff members and organization roles; verify real mapping for all authorized users.
4. View as manager and as two separate organizational staff accounts. Check: tasks assigned to user appear on user's board, other's private tasks don't, 'unassigned' visible only to manager, task opened from board shows original files, comments, mentions and events. Manager creates task assigned to authorized user → exact same task appears in their view after refresh; no duplicate task or altered legacy owner.
5. Add actual approved internal correspondence in test environment → correct received/sent accounts and history. Check `/work/mail` staff permission and display (existing module route). No fake ticket writes or migrations.
6. Check real calendar navigation, today / past / future, Persian label and conversion, works on desktop/mobile without overflow. Note source code uses Dubai organizational timezone, preserve it unless explicitly instructed to change. New view has weekly sidebar; complete monthly view access via existing /staff?view=plans.
7. The current dashboard deliberately **does not** bulk-create 40–50 old tasks or backfill 1000+ communications. It shows up to 50 actual, existing authorized tasks. Where too few exist, show a truthful empty state. The owner will later allocate unassigned historical operations separately with permission. No arbitrary owner assignment.
8. Confirm page scroll/board density, compact controls, no duplicated outdated 'تیکت‌ها و مکاتبات بین واحدها' giant top module, row actions accessible via keyboard, meaningful status labels and minimum click path.
9. Avoid excessive Work runs: one targeted diff, one test pass, only necessary repairs. Commit to a separate integration branch; **STOP** before main merge, publish, Hostinger migration, database writes to live customer data, or mass assignments. Report test evidence, changed files, residual defects, and recommended integration commit.

## Important known gaps — do not overstate
- This branch's React/TSX and CSS have been committed but TypeScript, production Build and actual browser/DB tests have NOT run through the GitHub connector.
- Visual similarity to the image needs desktop/mobile screenshot verification. The original image's numbers are illustrative, not system data.
- 'Work planning' record creation is currently manager-gated by the existing WorkApp, while users may have other permitted creation paths in the legacy internal ticket form. Do not loosen server permission merely to make a button visible.
- Recent mail panel fetches all authorized messages via the existing API and displays only seven newest; its full history remains on the mail page.
