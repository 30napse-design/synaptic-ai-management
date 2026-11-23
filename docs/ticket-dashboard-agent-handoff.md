# SYNAPSE staff ticket dashboard — approved four KPI cards and initial recent data
Branch `feature/ticket-staff-dashboard-2026-11-23`
Parent `feature/ticket-staff-desk-2026-11-23`

## User-approved experience
Replace the empty-looking staff ticket desk header with four compact, distinct colored status cards, responsive 4 columns desktop / 2 columns smaller screens:
- **همه تیکت‌ها** blue, inbox icon; returns all matching tickets.
- **پیگیری امروز** green, calendar/clock icon; filters real nonclosed due-today records.
- **منتظر پاسخ** amber/orange, hourglass icon; filters real `status='waiting'` records.
- **جدید** violet/purple, new-mail icon; filters real `status='open'` records.

All displayed counts come from existing database rows under server-side access scope, not demo numbers or client-side count of the current page. Clicking the cards updates the same live server filters; counts remain steady when switching between status cards because card aggregation excludes the selected status.

Retain the additional smaller quick follow-up controls **موعد گذشته، بدون مسئول، بی‌پاسخ / بدون اقدام** with their current server behavior. Do not duplicate the two primary status quick buttons underneath cards. Preserve existing employee ticket filters: one search for name/invoice/mobile/email, three dependent dropdown filters (category, topic, responsible role) and real ticket rows underneath. The final approved public/customer ticket creation form must remain unchanged.

## Initial content / no fake data
- Current server code previously showed at most 50 rows per page. **For ticket desk only**, show up to **100 most recent actual, permission-authorized records** on initial load. Other operations views keep 50 per page. Offset and nextOffset step must follow this per-view page size.
- There is **NO historical import, duplication, random distribution, creation of new tickets, automated assignment, fake statuses or rescheduling**.
- Existing Gmail, other messaging sources, legacy tickets, created_at/source_at, recorded category and status are retained. A ticket with no due date must never be counted as due today. A ticket with no recognized topic must not be falsely assigned to a new precise topic: it remains visible in the appropriate broad category or all records.
- Showing 100 real recent records is the selected alternative to a two-month date filter. Do not silently enforce a 30/60-day cutoff or auto-change record status to fill cards. If today/waiting/new count is zero, show ۰ truthfully.

## Changed files
`components/operations/ticket-dashboard.tsx`, `components/operations/ticket-dashboard.css`, `lib/operations-data.ts`, `app/operations/operations-app.tsx`, `tests/ticket-dashboard.test.mjs`.

## Agent integration/validation requirements
1. Compare this branch to actual current site HEAD and its runtime/DB implementation. Port focused diffs only, no unrelated full branch merge.
2. Verify the queries under the real schema, RBAC and both SQL runtime modes. Check selected-record index after the additional aggregate SQL query. Verify all KPI totals, 100-row initial page, pagination and status actions. Verify legacy Gmail tickets remain searchable and no duplicates, and status counts reflect access scope.
3. Test `node --test tests/ticket-dashboard.test.mjs` plus prior ticket/operations tests, TypeScript, production Build, desktop/mobile display and actual authorized staff click-through.
4. The user's rough estimate of 1000+ requests is **not a verified count** in this branch. Display actual database values, and explicitly report discrepancies.
5. Finish in a separate integration branch with commit and evidence. Stop before any deploy, migration, main branch write, Hostinger publish, changing old data, public website interaction, or customer messages.
6. No production/live data modifications or side effects simply to test the dashboard. Minimum Work credits.

## Current status
GitHub commit(s) exist; actual TypeScript/Build/browser/database validation must be performed by the agent. Do not claim these tests passed merely because source files are present.
