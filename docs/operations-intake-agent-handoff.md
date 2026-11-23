# SYNAPSE — approved incoming communications intake form / agent handoff
Branch: `feature/operations-intake-wireframe-2026-11-23`
Parent: `feature/sidebar-ux-compact-2026-11-23`

## User-approved design
- Both the ordinary `/operations` page and `/operations?source=incoming` show the **blue ثبت ارتباط ورودی** button and the **green ثبت تماس ورودی** button. Green button is a manual telephone-call entry shortcut until real telephony integration is separately approved; do not represent it as already connected.
- Both open one shared form. The form visually replaces old administrative access-scope chooser (server-side permissions MUST remain) and old separate direction/channel chooser with a single **نوع ارتباط** selector: تماس ورودی, تماس خروجی, مراجعه حضوری, ایمیل دریافتی, ایمیل ارسالی, پیام‌رسان‌ها. Messenger subtype can select WhatsApp, Telegram, Bale, Rubika, Instagram or LinkedIn.
- **دسته اصلی** and dependent **موضوع درخواست** use the previously approved site-ticket presentation taxonomy from `lib/ticket-support-taxonomy.ts`. Final invoice label **پیگیری ارسال فاکتور** and topic **ارسال فاکتور** must remain exactly.
- Preserve name, contact phone/email, invoice/order, organization, representative, dates and authorized follow-up staff selector. Follow-up assignment must use existing real active staff with server-side permission validation.
- Remove from the **new record form UI only** the older fields: نوع مشتری, نوع درخواست, بررسی اولیه مدارک, مدارک موردنیاز / پیگیری خارج از سامانه, ثبت به عنوان تیکت پیام, نوع تیکت, عنوان کوتاه (اختیاری), محدوده ارجاع واحد, روش دریافت. Do not drop columns, old records or legacy detail views.
- Replace the previous mixed required description box with **two required** fields: شرح تماس / درخواست مشتری and پاسخ پشتیبان / اقدام یا قول داده‌شده. Both values are incorporated into the existing `sourceBody` text and persisted through the existing operations API; old records are unchanged.
- Light-blue accents, green phone action, rounded muted borders; mobile responsive.

## Actual implemented code
- `components/operations/operations-intake-form.tsx`: shared React form for create modal, use same create payload.
- `components/operations/operations-intake.css`: scoped design and mobile CSS.
- `lib/operations-intake-ui.ts`: presentation source selector and explicit map to legacy operation subtype for current storage/routing.
- `app/operations/operations-app.tsx`: green phone button, common modal, existing detail view untouched.
- `tests/operations-intake-ui.test.mjs`: focused mapping/transcript unit tests.

## Risk limitations and follow-up
- The display topics **are not new persisted canonical subtype values**; compatibility maps them to existing approved subtypes while storing the exact selected displayed topic at the beginning of `sourceBody`. A future normalized category migration is separate and must be explicit and tested.
- Both mandatory text boxes are stored inside one existing source communication body, not as two separate conversation/event records. The agent should verify this presentation and decide whether a safe append-only event is needed.
- The choice of messenger platform is a secondary selector because preserving true source attribution matters.
- No telephony integration, outbound email sending, public web-ticket ingestion or data migration is provided.
- User's existing backend `dispatchReady()` path supersedes legacy POST create logic; verify the actual routing and access under both.
- Call intake should not expose phone capability to users lacking `calls`; verify security against `data.user` and server. The green action is already limited to canCall in UI.
- Check `isTicket` auto-detection for Gmail/message channels and ensure old Gmail tickets remain accessible. Do not clear any existing records.
- Run `node --test tests/operations-intake-ui.test.mjs`, full relevant TypeScript check and production build, visually test two buttons and each form mode on desktop and mobile. Test both `dispatchReady` states and staff owner assignment.
- Existing `main`, Hostinger and production site are not modified by this branch. Avoid full unrelated merges; cherry-pick focused changes onto the live-compatible branch after verification and explicit approval. No deploy or send.

## Test and commit
GitHub creation validates file presence, not runtime execution. TS/build/browser tests are NOT reported as passing until actually executed.
