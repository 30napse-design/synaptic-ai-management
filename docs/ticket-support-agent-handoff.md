# SYNAPSE — ticket and support final taxonomy | Agent handoff
Branch: `feature/ticket-support-taxonomy-2026-11-23`
Base: `feature/unified-research-cases-2026-11-23` (includes prior sidebar and case-management work)

## Approved UX (do not redesign)
Sidebar group **پذیرش و ارتباطات** with children in this exact order:
1. **پذیرش، ارتباط و پشتیبانی** (existing `/operations`)
2. **دفتر تماس‌های ورودی** (existing `/operations?source=incoming`)
3. **پذیرش نمونه محققین** (existing `/sample-intake`)
4. **تیکت و پشتیبانی** (existing `/operations?view=tickets`)
Remove *only sidebar shortcuts* for outbound communications and in-person visits. Preserve all old records, saved views and direct URLs for `?direction=outbound` and `?direction=visit`.

### Ticket taxonomy
Single ticket system, with tabs **تیکت‌های سایت** and **ثبت مستقیم سامانه**, and two dependent dropdowns **دسته اصلی**, **موضوع درخواست**. Site mode: optional textarea **شرح درخواست (اختیاری)**. Direct mode: keep title **عنوان پیام**, description textarea and multi-attachment UI for PDF/Word/PNG/JPG, with real, safe upload backend (not a fake filename text field). No change to approved direct-mode topics, apart from already-approved earlier wording.

The exact topic definitions live in `lib/ticket-support-taxonomy.ts`; use this as the single presentation catalog, not several copy-pasted lists. Last user edit is final and mandatory:
- Invoice category **پیگیری ارسال فاکتور** (not 'فاکتورها' and not 'پیگیری فاکتور')
- Invoice topic **ارسال فاکتور** included
- **درخواست پیش‌فاکتور** is removed; **پیگیری پیش‌فاکتور** stays
- Payment category **پرداخت‌ها و تسویه**, with **تسویه فاکتور** topic.
Keep all other topics and direct-mode groups from catalog unchanged.

Reusable UI component is `components/operations/ticket-category-selector.tsx` and scoped styles `components/operations/ticket-category-selector.module.css`. The component is deliberately not yet mounted to the production operations page or wired to its backend. Do NOT claim tickets can already be created using the new taxonomy.

### Critical safe integration requirements
- Current `app/operations/operations-app.tsx` serves existing operations and Gmail/message tickets. Current `lib/intake-policy.ts` and `lib/ops-policy.ts` define legacy category/subtype values and access rules. `lib/dispatch-engine.ts` persists operational requests and routing. Old Gmail, social messages, calls, visits and ticket records must remain intact.
- Do NOT replace existing database subtype strings with new display labels or reclassify historical records automatically. Introduce stable, versioned ticket taxonomy keys, a lossless compatibility mapping where logically exact, and separate new metadata for newly created site/direct tickets if required. Never map different concepts as if identical.
- Site-created tickets and direct-created tickets must have a unique ticket id, actual origin/channel and trusted timestamp, authenticated/verified sender rules, optional case/invoice link, responsible staff, status and audit trail. Public site ingestion must have rate limits, bot protection and authorization boundaries, and must not expose internal-only subjects. Uploads need size/type validation, malware scanning where available, private storage and authorized retrieval.
- Retain Gmail/social inbox and legacy `/operations?view=tickets` availability. New site/direct views must not silently remove older tickets from search/history.
- The final invoice topics include 'ارسال فاکتور' as a *request category only*. It must **not** automatically email or expose an invoice; delivery requires separate verified identity, authorization, approved invoice and explicit send workflow.
- Public-site 'امور داخلی و اداری' cannot expose staff finance, security, payroll, internal documents or restricted subtopics. Show only public-safe intake labels and route privately.
- Preserve the existing sample intake, projects, finance and work modules. No duplicate CRM, no parallel ticket database.
- Continue to serve existing website forms in their current WordPress/site environment until explicitly integrated; this GitHub branch does not change those sites.

### Agent steps
1. Inspect real current Hostinger branch and compare to this branch; port changes surgically without overwriting Hostinger-specific runtime/Postgres adjustments.
2. Integrate approved sidebar menu (separately if existing Hostinger sidebar not yet updated).
3. Wire two-source taxonomy into ticket UI, real CRUD/API, server-side validation, status and access rules, new ticket search/filter and legacy message visibility.
4. Make optional website description and direct-mode title/description/multi-file upload functional, with privacy protections.
5. Preserve the exact approved subject labels, including 'پیگیری ارسال فاکتور' and 'ارسال فاکتور'.
6. Run `node --test tests/ticket-support-taxonomy.test.mjs`, focused old operations/ticket tests, TypeScript and production Build. Verify old Gmail/tickets and outbound/visit links, role restrictions and test with separate staff accounts only in a safe test environment.
7. Commit changes on an independent integration branch and report affected files, tests, migration requirements and remaining gaps. STOP for approval.

## No deploy authorization
No direct write to `main`, production, running Hostinger branch, actual invoices or historical records; no merge, deploy, external form changes or customer email sending without separate approval. Use minimal Work credits.
