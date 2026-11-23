# SYNAPSE — compact employee ticket workdesk: agent handoff
Repository: `30napse-design/synapse-ai-management`
Implementation branch: `feature/ticket-compact-workdesk-2026-11-23`
Based on `feature/sample-intake-polish-header-2026-11-23`.
Do not merge unrelated branches into Hostinger, main or production.

## Owner-approved UX
The old screen `/operations?view=tickets` is visually cluttered and forces repeated scrolling before real requests. Create a **minimal employee workdesk** without affecting the separate customer-facing registration form, old Gmail/social messages, authorization or audit history.

1. Six **small** clickable, colored status cards in a **single desktop row**, 3 columns on small laptops, 2 on mobiles:
   - همه تیکت‌ها — blue
   - جدید — violet
   - پیگیری امروز — green
   - منتظر پاسخ — amber
   - موعد گذشته — muted coral
   - بدون مسئول — gray-blue
   These cards are served real counts under `operationsScope`; selecting one must update the real server query and the list. No fake counts. "بی‌پاسخ" is not a duplicate card of waiting: keep its existing backend definition separately if needed; never silently treat those as synonymous.
2. Hide ticket-only clutter: channel icon grid, redundant giant overview panel, unrelated long generic help and duplicate separate follow-up chips. These are present on other operations views and must remain there.
3. Small ticket filter panel with **one search input** (researcher, invoice, mobile, email); **source selector**: همه منابع / Gmail و پیام‌های قبلی / تیکت‌های سایت / ثبت مستقیم سامانه; three dropdowns: دسته اصلی, dependent موضوع درخواست, مسئول تیکت. Source is an explicit server-side filter on real source types/channel, not an invented historical reclassification.
4. Responsible positions shown as organization titles from the authorized 9 accounts, not raw staff personal names; if different real accounts share the exact same role, distinguish safely by email rather than silently hiding one. Never make permissions dependent on a display label.
5. Group assignment remains available to authorized managers/reception via a **collapsed "ارجاع گروهی"** control; default hidden. Never mass-assign historical records by default.
6. Existing ticket detail modal gets a compact width, orderly sections, scrollable source body and conversation, role-labeled assignee. Keep actual Gmail body, attachments, audit actors (names for historical events), genuine status and details. The existing /staff?view=board link remains available, but **not evidence of successful task assignment**.
7. Ticket list continues showing most recent 100 authorized original rows from existing database; no made-up examples or imported duplicates. Pagination for tickets steps by **100**; other operations views retain 50.
8. Responsive layout and a short accessible path from entering desk to its first actual ticket.

## Implemented files
- `components/operations/ticket-dashboard.tsx`, `ticket-dashboard.css`: six compact true-count cards.
- `lib/operations-data.ts`: two extra real, scoped counts, exact legacy/website/direct source filter.
- `app/operations/operations-app.tsx`: conditional page layout, source state and server query, six card actions, bulk drawer, compact detail, correct pagination.
- `components/operations/ticket-staff-filters.tsx`, `ticket-staff-filters.css`: source selector and compact staff filters.
- `tests/ticket-compact-workdesk.test.mjs`: targeted static regressions.

## High-risk integration checks — mandatory
**Do NOT publish until you verify all of the following:**
A. Full TypeScript, actual production Build, all ticket/reception/navigation tests, fresh HTTP, and visual desktop/mobile checks using an authenticated test staff account. Static code checks alone are NOT proof.
B. Count 6 KPIs from the real database and compare to filtered query. The six states can overlap (e.g. new and unassigned) and are not a partition. Never sum card counts or duplicate records to fill them.
C. Confirm 100-row pagination exactly matches backend limit and no rows disappear when navigating.
D. Confirm Gmail and historic social messages remain present and unaltered. Legacy source means Gmail/social. Site source matches actual `channel='website'`; direct matches `source_type='manual' AND is_ticket=1` excluding website/phone; if production app stores different exact origins, adapt query to **real schema** with compatibility tests, not guessed labels or destructive migration.
E. Confirm both status quick cards and topic/category selections work together, with actual RBAC. **Historical detailed topics are only filterable when recorded exactly**, not by imagined topic assignment. Group broad legacy topics correctly and show explicit zero when no reliable match.
F. Verify assignment from ticket details, single and bulk, through existing `lib/operations-manual-assignment.ts` and `lib/operation-work-link.ts`: source operation retains the same id; an authorized staff task `ops-work:<original-id>` or relevant dispatch role task is created/updated idempotently, linked to the original, proper owner, permission scope, due date, notification and action history. Test separately as manager and assignee, confirm task actually appears in **کارتابل وظایف و برنامه‌ریزی** of selected account and does not appear to unauthorized account. Check status synchronization after reply/update and no duplicate tasks. **Current source code includes a conditional ownerRole path that skips `operationWorkStatements`; verify the dispatch projection for these tickets rather than declaring every case works.** Do not change assignment policy or auto-assign all previous cases without separate approval.
G. If a version is already on the live site, compare exact git refs and cherry-pick focused changes only. Preserve UI changes recently completed for sample intake, finance, customer forms, header and sidebar. Minimum Work credits.
H. No database writes to live customer records for testing. Use staging or known disposable test records with permitted authorization.

## Deliverables and stop
Commit only scoped repairs on an independent integration branch; report commit(s), modified files, test outcomes, known gaps and whether ready for *approval*. Stop; **no merge to main, production, Hostinger deploy, customer sends, unapproved assignments, or database migration**.
