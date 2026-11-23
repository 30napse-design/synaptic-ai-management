# SYNAPSE — Staff ticket desk / filter simplification
Branch: `feature/ticket-staff-desk-2026-11-23`
Base: `feature/operations-intake-wireframe-2026-11-23`

## User-approved scope
Maintain the approved **ثبت تیکت** customer-facing form, its tabs **تیکت‌های سایت / ثبت مستقیم سامانه**, dependent dropdowns, optional description and any attachment handling. Do NOT rebuild the form or delete old Gmail and social tickets.

This task applies **below the customer form**, to the internal staff desk `/operations?view=tickets`. Keep the existing status quick filters: همه پیگیری‌ها، پیگیری امروز، موعد گذشته، بدون مسئول، بی‌پاسخ / بدون اقدام. They must use server-side query criteria and real counts, not merely change appearance.

Replace the inherited reception filter panels with:
1. One search field with placeholder **نام محقق، شماره فاکتور، موبایل یا ایمیل…**; server search in tickets limited to name, phone, email and reference.
2. Dropdown **دسته اصلی**, from the final approved website ticket taxonomy.
3. Dependent dropdown **موضوع درخواست**, only the selected category's topics.
4. Dropdown **مسئول تیکت**, using the **one owner plus eight organizational role accounts**, displayed by position title (not staff personal name), and filtered by real assignee email on server. The dropdown must not grant permission or set the assignee automatically.

This is one text search + exactly three dropdowns; preserve existing follow-up shortcut buttons separately. Other non-ticket operations filters and legacy URLs remain intact.

## Code in this branch
- `components/operations/ticket-staff-filters.tsx` + CSS: compact staff-only card, role labels and responsive layout.
- `lib/ticket-staff-desk.ts`: mapping of approved site category IDs to persisted legacy category IDs; role labels.
- `app/operations/operations-app.tsx`: ticket-only filter layout, params, staff assignment role labels and preserved follow-ups. Non-ticket operations keep their existing UI.
- `lib/operations-data.ts`: server-side filtering on authorized scope; exact topic matching from new ticket textual prefix or exact unchanged legacy subtype. Restricts ticket text search to four customer identity fields.
- `tests/ticket-staff-desk.test.mjs`: focused tests.

## Critical integration limits
- Historical Gmail items use legacy category and subtype values. A new website topic and old subtype are not always equivalent. Category filter includes old records in the corresponding legacy group. Fine-grained topic filter includes only exact new tagged records or legacy rows whose subtype **exactly matches** the selected topic; it must not silently rewrite or misclassify old records. Show an honest zero/partial result if no exact match. In later production-grade backend, prefer versioned structured metadata and tested explicit mapping.
- The two newer entry sources ('site' versus 'direct') must ultimately be persisted separately. This branch only exposes the approved *website* topic catalog in staff filters; the direct-request topic taxonomy is preserved unchanged but is not yet connected as a separate staff filter dimension. Do not invent or infer origins from Gmail.
- The user requested automatic routing to eight/nine positions where safe, but accepted manual selection if needed. This branch implements manual selection/filtering by actual 9 registered roles, NOT new automatic assignment policy. Backend `mayAssignWork`, `canUseOpsCategory`, `validOpsAssignee`, org permissions and privacy rules remain authoritative. A rule-based dispatcher must be separately designed, tested and approved; never auto-assign sensitive cases based only on ambiguous category names.
- Existing staff accounts, personal names in authentication/audit and original records remain unchanged. Only position titles displayed in staff ticket selection UI.
- Do not expose the staff-only desk or its client data to website visitors. The planned public ticket form requires dedicated rate-limited anonymous/public intake API, validation, access control and anti-abuse safeguards; do not put internal /api/operations or authenticated staff selection onto public website.
- Review and test Gmail old tickets, direct/website new requests, follow-up due dates, unassigned count and assignment role permissions in actual test database. Do not claim verified production activity based on static code alone.
- Visually compare desktop and mobile screenshots with requested compact, professional blue/white accents.

## Agent instructions
1. Compare this branch with the actual active site and other ticket development branches; cherry-pick **only ticket staff desk changes**, avoid broad merges.
2. Check final taxonomy text/permission scope and correct functional gaps. Preserve the customer ticket form and all legacy data.
3. Run node --test tests/ticket-staff-desk.test.mjs and existing operations/ticket tests, TypeScript, production Build; run authenticated desktop and mobile visual/functional checks. Explicitly test old Gmail categories and exact topic behavior, search, status shortcuts, and nine-role dropdown.
4. Commit changes to a dedicated integration branch and report actual tests and regressions. Stop before merge, deployment, database migrations, customer emails, or public website changes.

Do not touch main, published SYNAPSE or Hostinger without explicit authorization. Minimize Work credit use.
