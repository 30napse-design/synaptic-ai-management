# SYNAPSE — Nine-Domain Intake + Unified UX / Motion / Real Status

Branch: `feature/synapse-nine-category-experience-2026-11-23`
Based on: `fix/operational-intake-engines-2026-11-23`
Never overwrite the currently deployed Hostinger branch wholesale. Do file-scoped reconciliation and staging tests.

## Owner intent
Deliver a clean international-standard interface across existing SYNAPSE screens WITHOUT deleting, renaming or changing existing records, routes, forms, authorized approvals, finance rates, laboratory catalogs, staff accounts or histories. User also wants Gmail/inbound calls organized by **nine main responsibility categories**, with visible owner, status, searchable records, bell/messages and a cinematic Synapse entry animation.

## Exactly nine responsibility areas, NOT nine staff logins
`lib/intake-nine-groups.ts` implements read-only mapping of existing authoritative `ops_items.category/subtype` to:
1. پذیرش، سفارش و تحویل نمونه
2. فاکتور، پرداخت، مانده و استرداد
3. نتایج، رفع اشکال و تصمیم علمی
4. پیشرفت پروژه و هماهنگی آزمایشگاه
5. بررسی تخصصی و اجرای آزمایش
6. استخدام، اسناد و امور داخلی
7. مشکلات سامانه، اتصال و دسترسی
8. اختلاف حساس، تأخیر جدی و موارد مبهم
9. تصمیم نهایی مدیریت در موارد استثنایی

Nine existing organizational accounts/roles are separate from these nine groups.

**Crucial:** Old Gmail/call records have *seven* canonical `ops_items.category` keys (plus visits) and more granular subtypes. Exact nine-group historic classification is NOT always derivable from these. For the exceptional three areas, only EXPLICIT existing subtypes qualify. Ambiguous/manager-only rows appear in a manual-review group and must NOT be assigned, recategorized or approved based on heuristics. NO historical backfill, schema migration, ML classifier or auto-owner assignment was performed.

The nine filters in `app/operations/operations-app.tsx` pass `nineGroup` to `lib/operations-data.ts`. SQL applies the RBAC scope FIRST, then the nine-group condition BEFORE pagination/count. A visible row receives a non-destructive label. Home has quick links to these filters. Confirm one-to-one mapping with actual legacy import labels before any automated write-based classification.

## Operational home & search
`lib/home-data.ts` reads permission-scoped counts directly from ops_items: all, new, doing, waiting/review, closed, unassigned, Gmail, phone. `components/workspace/personal-home.tsx` displays live numbers and links to existing view/status filters, not fictitious data. Work tasks and permission checks remain unchanged. `lib/global-search.ts` extends global query to source_body and call_date while retaining original operationsScope + canSeeOps checks and bounded results.

Important: the dashboard numbers refer only to **what the logged-in user may access**, not necessarily the global 1098 records. For manager the count should reflect all authorized records. A task counter is not identical to a Gmail/contact counter.

## Login motion
`app/login/login-form.tsx` gains purely decorative SVG Synapse neon flyby from left and `app/login/synapse-login-motion.css`, with timeline 0–2350ms, then login-card reveal. Existing username/password, auth endpoint, return_to, account settings, setup path and ChatGPT management login are completely unchanged. Form is never hidden from screen readers or keyboard by JS state. Respect `prefers-reduced-motion` and touch layouts. No image asset was newly added or copied.

## Global visual layer & header
`components/workspace/synapse-experience.css` is imported from the existing `workspace-shell.tsx` and changes only color, gradients, spacing, shadows, borders, focus and hover states. Keeps all layout and data controllers. Responsive, subdued motion and reduced-motion support.

Bell `components/workspace/work-notifications.tsx` is already a real API-backed control with `GET/POST /api/work/notifications`; message button `home-toolbar.tsx` calls `GET/POST /api/header/messages`, search calls `GET /api/search`. No second notification engine created. Must run actual click/mark-read checks with authorized accounts, especially empty/failed states. Do not claim push notifications or email delivery.

## Mandatory real QA before production
1. `pnpm install --frozen-lockfile`, `node --test tests/synapse-nine-category-experience.test.mjs tests/operational-intake-engines-integration.test.mjs tests/operations-intake-ui.test.mjs tests/navigation.test.mjs tests/standalone-sample-intake.test.mjs`, `pnpm exec tsc --noEmit`, `pnpm build`.
2. Test manager + nonmanager logins with fixture or existing test accounts on staging only; verify private categories never leak; compare SQL total/page results to original source; correct scope and permissions on all category buttons.
3. Search a real Gmail thread's body, an exact incoming call customer, phone, invoice, and call date; test empty state and mobile.
4. Bell: new notification, number, click, mark read, re-open; messages: unread, click, mark read, account scoping; no double counts, no false positive.
5. Login: flight from left after page load, then card reveal, no form focus lock; desktop/mobile and reduced motion.
6. Home: counts directly query real authorized records, unassigned queue accessible to manager, never infer payment confirmed. Permissions checked before exposing figures.
7. Screenshot audit on all major modules, not just dashboard: 360px, 768px, 1280px, 1536px, RTL, contrast, dropdowns, modals, scrollbar, button visible focus. Pixel-perfect overhaul of every route is NOT demonstrated merely by a shared theme.
8. Verify no change to DB row count, assignees, statuses, attachments, role IDs, 203 AN/102 HP approved services, finance or main. Compare with newer Hostinger branch before cherry-pick.
9. **No merge, publication, activation of Hostinger email OAuth/cron or live record edits without owner's explicit approval.**

## Known limits
This branch provides real code and can run GitHub CI, but CI alone does not prove production Hostinger/runtime data compatibility, browser animation timing, or staff access. Source-linked classification shows approved nine domains; it does NOT automatically and correctly reclassify every historic email/phone call whose metadata lacks enough evidence. Those items stay in the review queue.
