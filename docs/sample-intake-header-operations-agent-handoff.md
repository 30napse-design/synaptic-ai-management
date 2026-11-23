# SYNAPSE — Sample Intake Design + Global Header + Reception Filters
## Agent handoff / owner-approved UI
Branch: `feature/sample-intake-polish-header-2026-11-23`
Base: `feature/ticket-staff-dashboard-2026-11-23`
Repository: `30napse-design/synapse-ai-management`

### 1. Preserve the scientific sample-intake workflow
Use existing `/sample-intake`, `/api/sample-intake`, `lib/researcher-sample-intake.ts` and the existing **mother case**, without creating a second form, second case, new lab catalog, or migration.

The accepted illustration has: soft blue laboratory hero, heading «پذیرش نمونه محققین», clear link «مدیریت یکپارچه پرونده‌ها و پروژه‌ها», a left summary sidebar, three-step flow, a white rounded registration form, and a prominent list of actual registered samples **below** it. Keep the approved palette:
- hero pale blue #D6E8FF, white #FFFFFF, muted borders #D5E4F5,
- dark navy text #153E79,
- action blue #138BD3 and teal #11865F,
- amber #FFF4E4 for announced shipments,
- green #E7F6ED for received and #EFF8F3 for accepted samples.
Mobile: hero wraps, sidebar stacks, minimum two-column status where useful, forms are single-column, registry horizontally scrolls. No dead or fake controls.

Original 3 real stages must survive:
1. Sample / substance / animal details, linked to **approved order row and invoice**: named researcher, phone, email and organization inherited from mother case; soft/hard tissues, blood/serum/plasma, cellular/molecular materials, medication, amounts, mg/g/mL/µL, number, preparation, storage/transport, supplying party, treatment and real destination.
2. Shipment announcement and actual physical receipt with approved quantity caps, transport, from/to, timestamp, custody and discrepancy.
3. Acceptance/full/conditional/reject/science decision, follow-up and audit. Physical receipt does NOT mean lab receipt or science approval.

### 2. Registered samples summary, not invented data
`readResearchIntake` now exposes an `overview` of the most recent 100 **real, already permission-scoped** items from existing mother-case snapshots, no extra tables. There is a searchable/five-status registry at the bottom of the page. Count labels are about this recent list, **not global all-time totals**. On successful registration, the existing POST refresh makes a registered item appear below the form. No duplicate or unapproved sample is created. If query filters restrict projects, list is restricted accordingly.

Existing item records, shipping events, custody, photos, PDF, lab destinations, invoice associations, audit and permission checks are retained.

`components/laboratory/sample-intake-dashboard.tsx` supplies the hero, stages, recent registry and a direct **«گردش تحویل آزمایشگاه»** link. This deep-link opens the existing authorized **«نمونه‌ها و تحویل‌ها»** tab with `?id=...&caseTab=samples` through a tiny addition in `laboratory-center.tsx`. The actual `sample_move` or `mother_item_move` send/receive and confirmation are still executed by existing guarded backend operations, NOT by merely clicking the link.

**Before launch, verify the exact two-party handoff:** reception physically receives & reviews, authorized staff sends to destination, lab account confirms receipt or discrepancy with a durable actor/time history. If the existing UI does not expose a smooth direct path, complete it with the current custody API and existing order/lab IDs; do not mark a sample received automatically or bypass approved financial/scientific prerequisites. Do not invent destinations.

### 3. Header across ALL pages
`components/workspace/account-menu.tsx`: Persian account holder name and English organizational role underneath (Institute Director for owner), not mixed Persian/English with a dash; visible account-settings gear directly linking to `/account`; retain dropdown, change password and secure exit. Shared CSS gives the AI icon a **subtle neon glow**, internal mail **green**, notifications **golden yellow**, and a light professional header background. Avatar is still loaded from existing `/api/profile/avatar`; the profile screen already includes actual PNG/JPEG upload (2 MB). DO NOT claim photo uploads are fixed until authenticated GET/POST work on actual deployment.

**Known runtime blocker:** Current `app/api/profile/avatar/route.ts` depends on `cloudflare:workers` `env.BUCKET`; Hostinger or Postgres ports may require their explicitly approved private file storage adapter. Check current runtime and correct with secure backend only if needed (no public images bucket, no unnecessary migration). Do not remove avatar access security or expose private data.

### 4. Reception & customer operations filters
Keep existing `/operations`, inbound-calls view, outbound/visits routes, quick follow-up chips, Gmail and old data. The new staff-only `OperationsStaffFilters` replaces cluttered reception controls (request type دانشگاهی/صنعتی/دارویی, document-state dropdown, unrelated status selector) with:
- one search for researcher name, phone, invoice, email,
- exactly three dropdowns: «دسته اصلی», dependent «موضوع درخواست», «مسئول پیگیری» by one owner + eight known roles, presented as **position titles**, not staff personal names,
- approved website-topic catalog and direct/collaboration catalog from `lib/ticket-support-taxonomy.ts`.

Existing /operations server adds scoped exact `opsGroup` and `opsTopic` handling; old Gmail and operation subtypes are NOT changed. Note: historical requests can be matched by broad legacy category; a newly agreed topic only matches historical records when its exact subtype or recorded topic prefix matches. Do not silently infer detailed types from arbitrary emails or claim complete normalized data. RBAC must remain in `operationsScope`. Existing filters through old links may remain for backwards compatibility; do not show misleading old filters in the new reception UI.

### Files in this branch
- `components/laboratory/sample-intake-dashboard.tsx` and `.module.css`
- `components/laboratory/researcher-sample-intake.tsx` and `.module.css`
- `lib/researcher-sample-intake.ts`
- `components/laboratory/laboratory-center.tsx` (safe sample-tab deep link only)
- `components/workspace/account-menu.tsx`, `shared-toolbar.css`
- `components/operations/operations-staff-filters.tsx`, `operations-staff-filters.css`
- `app/operations/operations-app.tsx`, `lib/operations-data.ts`
- `tests/sample-intake-ux-regression.test.mjs`

### Agent validation and deployment gate
1. Compare this branch against the actual currently deployed/runtime branch, **especially** its Hostinger/Cloudflare adapters, do NOT wholesale merge or overwrite unrelated changes.
2. Run relevant existing tests including researcher sample intake runtime, custody, mother workflow, receptionist role permissions, old Gmail, plus `node --test tests/sample-intake-ux-regression.test.mjs`; run TypeScript and production Build and actual HTTP.
3. Using a test project with a real approved order row, as an authorized reception user register a **sample, drug or material**, verify exact item appears in lower registry after POST+reload, with correct invoice/customer/quantity/destination. Then test shipment → physical receipt → review → handoff → authorized lab receipt, repeated submission idempotency, discrepancy, disabled unauthorized cases, project archive and rejected attempts. Never do these modifications to live customer data just for testing.
4. Test header navigation, portrait photo upload, AI/mail/notifications, profile on desktop/mobile and at real Hostinger runtime; verify accessibility and responsive layout, no doubled scroll.
5. Test reception category/topic filters and nine role choices against actual permissions, including historic Gmail and direct requests.
6. Report failures, fixes, test results, modified files, final commit. No deployment, no main merge, no change to production, customer messages, financial approvals or existing records without separate user authorization. Minimum agent/Work credit.

### Status
Source code and docs committed in GitHub. Production Build, real tests, image upload and cross-account laboratory receipt have not been verified in this branch. Site is not published from this branch.
