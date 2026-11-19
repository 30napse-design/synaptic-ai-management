# FIN-07: petty cash operations and activation handoff

Status: implemented and tested with synthetic isolated data; not deployed. The existing route is `/finance/petty-cash`, using `/api/petty-cash` and its existing private files API. No parallel ledger, customer, project, bank importer, ticket engine or scheduler was created.

## Source and compatibility

Development branch: `feature/finance-petty-cash-2026-11-19`. Based on completed FIN-06 `dbbde0a348658998afe19231eeb46da203578249`, which contains FIN-05 `a16d84d6a54644dacd0b909a31bb9fe484d9ffd4`, FIN-04 `93342aeac61e71f6ace7a7c4cb27e5d58c5c715c` and stored laboratory-v58 `559e2a899d3dfdc62b30f1e342c84b9af38584c0`. No automatic merge or production migration. No laboratory/sample/result implementation was overwritten. Refresh of GitHub refs found no newer overlapping source change at delivery.

## One ledger and independent balances

`petty_entries`, `petty_periods`, `petty_events`, `petty_files` remain canonical. Fund definitions, delegated grants and authority limits use the existing `finance_settings` row `petty-registry`; FIN-05 requests/transactions and FIN-06 companies/accounts remain canonical. A person can own several funds; periods are keyed by fund and Persian month.

Opening, actual deposited/returned funds, declared physical spending, accepted expenses and accountable balance are separate. Unknown or unreviewed historical opening is null, never a fabricated zero. Signed negative historical openings remain negative. Rejected/voided spending does not invent a physical refund. A replacement claim keeps the original cash origin; proven duplicate claims can be resolved with evidence without creating a second expense or cash movement. A negative position is not automatically classified as an employee debt.

Opening proposal and approval are independent. Closed periods reject ordinary edits. Settlement requires known opening, reviewed documents, no unresolved issues and an exact observed balance. Carry uses the approved closing once. A period already carried forward cannot simply reopen: use an authorized documented forward correction. Custody transfer requires the latest settled period, a signed memo and independent approval; historical owners remain unchanged.

## Three scoped views and security

Custodians see their permitted funds, claims and balances. Finance sees authorized review queues. Management sees only decisions requiring its recorded authority. `petty_cash` is not a general bank/customer/management grant; laboratory membership overrides broad legacy permissions. Technical administration alone gives no financial approval. Fund grants have server-checked scope and expiry. Creating/owning a claim does not authorize its approval.

Every mutation checks fund, period, original record revision and current registry authority. CAS guards serialize approval, funding, settlement and handoff. Existing historical/global rows are unassigned until the Owner explicitly reviews/maps them. Private finance notes, other custodians' balances, files, searches, counts, exports and history are filtered server-side. Referral uses the shared ticket/dispatch engine with an explicit safe message; raw balance/account/receipt data is not copied into a public ticket.

## Funding, cash evidence and FIN-05/06

Charge requests are existing FIN-05 payment requests with `petty_fund_id`, not a second payment ledger. Approval creates no money. Bank-verified payouts and returns use the existing FIN-06/FIN-05 transactions and stable `fin05-charge:<transaction>` / `fin05-return:<transaction>` mirrors. Returned funding affects the actual return period and does not rewrite a closed original period. Charge requests cancelled/rejected in FIN-05 project their canonical state back to FIN-07.

Documented physical cash is a distinct optional path in the same FIN-05 engine. It is disabled by default. The Owner must identify a cash source code and an existing FIN-06 legal company before use. A real private voucher uploaded to the same request, explicit actual handover, current approved request version and a second authorized approver independent of the proposer/recipient are required. Proposal/hold/rejection changes no balance. Verified cash handover/return posts one canonical transaction and one fund mirror, with original voucher hash and actors; it creates no fictitious bank line. A return references the original same-source payout and cannot exceed it. `cash_documented`, `petty_documented` and bank verification remain distinct. These control-ledger records do not prove a real cash-vault balance or statutory accounting compliance.

Ordinary accepted cash expenses post once. If an approved FIN-05 purchase already recognized the cost/asset/deposit, the petty receipt settles that existing payable through a documented non-bank transaction; it does not create another expense, asset or bank withdrawal. Correction preserves the receipt and reverses the exact existing accounting/payment event. An asset purchase, deposit, funding or transfer is not automatically an accounting expense.

## Existing modules and operational UI

The existing FIN-06 financial components/theme provide the custodian, finance and management layouts, filters, detail drawer, conditional forms, opening/settlement/handoff panels and actual scoped XLSX/PDF exports. Project costs reference the existing mother project/invoice. FIN-01 reads fund summaries and the existing reminder engine reads pending receipt deadlines; FIN-02/08 read accepted references and canonical journal entries. Confidential internal costs are absent from quote-only/customer/laboratory views.

Legacy Sheet import preserves original row/source/date/document/amount and provisional controls. Formula-only rows remain source evidence, not invented expenses. Imported history does not become verified bank money. A historical charge can only be reconciled to an already verified FIN-05 mirror with the same fund, period and amount; the old row/source remains as an audited superseded reference, not a second deposit. Reviewed historical expenses become accepted references without creating another journal event. The existing expiring exact-body `SYNAPSE_PROVISION_REQUEST` mechanism remains optional and disabled unless explicitly configured; it does not authorize new arbitrary real accounts. Passwords and private source payloads are never committed.

## Migration and activation boundary

Prepare `drizzle/0024_petty_fund_workflow.sql` after all migrations through 0023. It adds fund/period metadata and receipt hashes plus scoped indexes, with empty defaults for historical rows; it does not infer owners, opening balances or verified receipts. `db/schema.ts` and the migration journal match. A disposable pre-0024 fixture verifies the negative opening, original source/entry/receipt and integrity survive. No production database, R2 object, account, credential, cash handover or old record was changed.

Before an authorized release: review the existing backup/restore procedure, obtain and validate a separate private D1/R2 backup, test 0024 on a restored copy, authorize release/migration, configure approved fund ownership/grants/limits, review historical mappings/opening evidence and complete real browser/account acceptance. Existing staff grants are not revoked. Real cash mode needs Owner-approved source/company and actual independent sign-off. Real bank integration and scheduled operation require their own approved source/credentials/host. No cron, paid AI or bank connection is activated by FIN-07; normal manual operation requires none of them.

## Verification and limitations

Final TypeScript and production Build passed. FIN-07 has 51 named isolated runtime cases and 310 HTTP checks, including actual synthetic session login, forced password change, logout/relogin and persisted reload. Pure utility/shared workbook/PDF tests: 12 passed. Historical migration preservation: 1 passed. Related regressions passed: FIN-04 157 HTTP checks; FIN-05 304; FIN-06 305 (35 named cases); core finance 113; dashboard 60; legacy petty provisioning/import/privacy/history/correction passed. Across these suites and FIN-07, 1,249 HTTP checks passed, plus 12 unit tests and one historical migration-preservation test.

The 60-case acceptance matrix below distinguishes 53 fully covered isolated checks, 3 partial cases and 4 browser-only cases not run. API/SSR is not browser acceptance: conditional-form interaction, all buttons, loading transitions and exact desktop/mobile layout remain to verify. No supported interactive browser runtime was available; no actual UI screenshots are supplied. SSR chart rendering emits Recharts container dimension warnings (-1); actual viewport layout is unverified. Real staff, bank authentication, cash handover and production recovery are not tested. PDF/XLSX exports are generated from synthetic records, not real financial information.

Commands (run after dependencies are installed):

```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/test-finance-runtime.mjs finance-petty-workflow-runtime.mjs --package5-fixtures
node --test tests/finance-petty-summary.test.mjs tests/finance-bank-bidi.test.mjs tests/bank-workbook.test.mjs
python tests/finance-petty-workflow-migration.test.py
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs finance-payments-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-bank-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-petty-runtime.mjs
```

Each runtime harness uses a separate disposable D1/R2 instance. Apply migrations only there during testing. A successful source build/commit does not prove production data recovery.

## FIN-07 acceptance matrix

| ID | Requirement | Input | Expected | Observed result |
| --- | --- | --- | --- | --- |
| FIN07-01 | تنخواه‌دار هزینه جدید ثبت کند. | Pre-existing synthetic legacy account fixture; actual synthetic login and forced password change | Authenticated limited custodian can create one expense | PASS — isolated backend |
| FIN07-02 | برای هزینه، تصویر رسید بارگذاری کند. | Upload actual synthetic receipt | Private file retained and retrievable by custodian | PASS — isolated backend |
| FIN07-03 | رسید ناقص برای اصلاح بازگردد. | Submit, return incomplete receipt for correction | Correction state and public explanation retained | PASS — isolated backend |
| FIN07-04 | فرم فقط فیلدهای مرتبط را نشان دهد. | Expense and noncash request types | One canonical ledger; unrelated financial fields unnecessary | PARTIAL — API/SSR passed; interactive browser not run |
| FIN07-05 | هزینه عمومی بدون پروژه مادر ثبت شود. | General office expense, no mother project | No dummy project created | PASS — isolated backend |
| FIN07-06 | هزینه پژوهشی به پرونده مادر معتبر متصل شود. | Research expense with real isolated mother record | Reference the existing mother ID, no duplicate project | PASS — isolated backend |
| FIN07-07 | رسید تکراری شناسایی شود. | Repeat same file bytes | Same file ID; no second attachment | PASS — isolated backend |
| FIN07-08 | مبلغ و تاریخ نامعتبر رد شوند. | Invalid money/date | Invalid amounts and impossible Jalali date rejected | PASS — isolated backend |
| FIN07-09 | تنخواه‌دار فقط دفتر مجاز خودش را ببیند. | Two custodians and multiple funds | Each custodian sees only authorized funds and records | PASS — isolated backend |
| FIN07-10 | تنخواه‌دار نتواند مانده سایر افراد را بخواند. | Direct other fund query | Other fund/balance rejected without disclosure | PASS — isolated backend |
| FIN07-11 | لینک مستقیم رسید شخص دیگر رد شود. | Direct private receipt link | Peer cannot download receipt | PASS — isolated backend |
| FIN07-12 | API درخواست غیرمجاز را رد کند. | Unauthorized edit by ID | Server checks record and fund scope | PASS — isolated backend |
| FIN07-13 | جست‌وجو اطلاعات افراد دیگر را افشا نکند. | Search by another custodian document | Search and counts do not reveal peer records | PASS — isolated backend |
| FIN07-14 | خروجی Excel و PDF فقط رکوردهای مجاز داشته باشد. | Own XLSX/PDF exports, peer filters | Actual binary outputs are private and scope-filtered | PASS — isolated backend |
| FIN07-15 | کارمند آزمایشگاه نتواند موجودی تنخواه را ببیند. | Laboratory-only identity | Lab does not gain internal petty ledger access | PASS — isolated backend |
| FIN07-16 | مدیر فنی فاقد مجوز مالی نتواند هزینه را تصویب کند. | IT manager attempts financial review | Technical role confers no financial authority | PASS — isolated backend |
| FIN07-17 | امور مالی رسید را بررسی کند. | Finance checks completed document | Ordinary authorized expense posts one balanced journal | PASS — isolated backend |
| FIN07-18 | هزینه خارج از اختیار به مدیریت ارجاع شود. | Expense exceeds per-document finance authority | Finance cannot approve; management queue receives document | PASS — isolated backend |
| FIN07-19 | ثبت‌کننده نتواند درخواست شخصی خودش را تأیید کند. | Finance creates own expense | Self approval prohibited on both old/new APIs | PASS — isolated backend |
| FIN07-20 | رد هزینه تاریخچه و دلیل داشته باشد. | Rejected expense was actually spent | Rejection preserves cash declaration and audit | PASS — isolated backend |
| FIN07-21 | اصلاح سند مصوب بدون گردش معتبر مسدود شود. | Edit approved expense through old or new writer | Approved source immutable; documented correction has its own event | PASS — isolated backend |
| FIN07-22 | بررسی هم‌زمان باعث تصویب تکراری نشود. | Two concurrent approvals of one receipt | At most one approval/journal, stale request rejected | PASS — isolated backend |
| FIN07-23 | درخواست شارژ به گردش FIN-05 متصل شود. | Charge request created by custodian | Existing FIN05 payable created/submitted once, not a new charge | PASS — isolated backend |
| FIN07-24 | تصویب درخواست، بدون انتقال واقعی وجه، موجودی ایجاد نکند. | Finance review and Owner approves charge | Approval creates no cash custody balance | PASS — isolated backend |
| FIN07-25 | شارژ معتبر فقط یک‌بار در تنخواه ثبت شود. | Real synthetic bank row verified through FIN06 | One immutable canonical FIN05 charge appears in correct fund | PASS — isolated backend |
| FIN07-26 | تطبیق بانکی در صفحه ۰۶ منبع وضعیت واقعی باشد. | Bank source and repeat verification | Canonical bank row is authoritative; duplicate cannot mirror twice | PASS — isolated backend |
| FIN07-27 | برگشت شارژ با رویداد اصلاحی ثبت شود. | Original charge returned with independent event | Declared return changes no cash until bank confirms; original retained | PASS — isolated backend |
| FIN07-28 | شارژ تنخواه به‌عنوان هزینه حسابداری دوباره‌شماری نشود. | Charge versus expense recognition | Funding is not another operating expense | PASS — isolated backend |
| FIN07-29 | مانده افتتاحیه معتبر حفظ شود. | Signed historical opening -100m rial | Opening kept negative after independent proposal and approval | PASS — isolated backend |
| FIN07-30 | مانده منفی تاریخی حذف نشود. | Create next period while previous has negative history | New unconfirmed period cannot zero historical balance | PASS — isolated backend |
| FIN07-31 | داده‌های تاریخی مبهم، وضعیت نیازمند بررسی داشته باشند. | Unmapped and ambiguous imported historical document | No guessed opening; original evidence and difference retained | PASS — isolated backend |
| FIN07-32 | هزینه اعلام‌شده از هزینه تأییدشده تفکیک شود. | Declared rejected spending versus accepted expense | Cash declaration survives rejection/void without invented balance | PASS — isolated backend |
| FIN07-33 | وجه برگشتی مانده را صحیح تغییر دهد. | Verified returned funds | Signed original-source return reduces custody once | PASS — isolated backend |
| FIN07-34 | دوره دارای مغایرت، تسویه کامل نشود. | Attempt close with unresolved/rejected spending | Settlement refused when discrepancy remains | PASS — isolated backend |
| FIN07-35 | مانده مجاز به دوره بعد منتقل شود. | Clean fund closes and carries500 rial | Documented positive balance carried exactly, not reset or duplicated | PASS — isolated backend |
| FIN07-36 | اصلاح دوره بسته‌شده تاریخچه را حفظ کند. | Closed source has a dependent carry | Blind edit/reopen blocked and history preserved | PASS — isolated backend |
| FIN07-37 | انتقال مسئولیت تنخواه با صورت‌جلسه معتبر انجام شود. | Handoff settled current period with signed memo | Independent approval changes future responsibility; old ownership preserved | PASS — isolated backend |
| FIN07-38 | FIN-01 گزارش مانده و هزینه را درست بخواند. | FIN01 reads the existing journal and petty queue | Dashboard still renders authorized financial data | PASS — isolated backend |
| FIN07-39 | FIN-02 هزینه پروژه‌ای را از همان شناسه اصلی بخواند. | FIN02 project link uses original expense ID | Internal linked cost has exactly one source row | PASS — isolated backend |
| FIN07-40 | FIN-05 هزینه تأییدشده تنخواه را دوباره ثبت نکند. | FIN05 reads accepted expense projection | No duplicate payable for petty expense | PASS — isolated backend |
| FIN07-41 | FIN-06 شارژ و برگشت وجه را صحیح مرتبط کند. | FIN06 linked charge and return bank lines | Both actual bank signs verified without customer receipt pollution | PASS — isolated backend |
| FIN07-42 | FIN-08 فقط رویداد حسابداری معتبر را دریافت کند. | FIN08 journal canonical recognition | All journals balanced; old correction preserved | PASS — isolated backend |
| FIN07-43 | کارتابل محقق هزینه داخلی محرمانه را نمایش ندهد. | Customer portal/mother request | Internal petty ledger cannot be obtained by customer role | PASS — isolated backend |
| FIN07-44 | مسیر آزمایشگاهی معتبر و نسخه ۵۸ تخریب نشود. | Existing laboratory case and intake paths | Original laboratory work/order records preserved; no scientific permission inferred | PASS — isolated backend |
| FIN07-45 | گردش پذیرش و درخواست خرید قبلی برقرار بماند. | Existing payment/purchase and admission paths | Existing APIs still serve source records without duplicate imports | PASS — isolated backend |
| FIN07-46 | نمای تنخواه‌دار در موبایل قابل استفاده باشد. | Browser interaction at required viewport | Usable actual rendered controls | NOT RUN — browser unavailable |
| FIN07-47 | نمای امور مالی در دسکتاپ و موبایل صحیح باشد. | Browser interaction at required viewport | Usable actual rendered controls | NOT RUN — browser unavailable |
| FIN07-48 | نمای مدیریت بدون ازدحام اطلاعات نمایش داده شود. | Browser interaction at required viewport | Usable actual rendered controls | NOT RUN — browser unavailable |
| FIN07-49 | فیلترها روی جدول و کارت‌ها اثر واقعی داشته باشند. | Fund/category/status and text filters | Filtered rows/cards/totals derive from accessible original rows | PASS — isolated backend |
| FIN07-50 | تمام دکمه‌های عملیاتی نتیجه مشخص داشته باشند. | Role-based SSR and API actions | All three page views load; browser click behavior not claimed | PARTIAL — API/SSR passed; interactive browser not run |
| FIN07-51 | فرم هوشمند بدون فیلدهای نامربوط باز شود. | Browser interaction at required viewport | Usable actual rendered controls | NOT RUN — browser unavailable |
| FIN07-52 | خطاهای ثبت و بارگذاری واضح باشند. | Bad form and unsupported attachment errors | Server returns actionable non-success without modifying history | PASS — isolated backend |
| FIN07-53 | نمودارها با داده و فیلتر معتبر به‌روزرسانی شوند. | Charts after filters | Chart aggregates equal the same permitted filtered ledger | PASS — isolated backend |
| FIN07-54 | حالت خالی، بارگذاری، خطا و عدم دسترسی درست نمایش داده شود. | Empty filter, authorization error and unknown opening | Clear empty results; no fake zero balance | PARTIAL — API/SSR passed; interactive browser not run |
| FIN07-55 | TypeScript بدون خطای مرتبط باشد. | TypeScript compiler on the final source | No compiler errors | PASS — isolated technical |
| FIN07-56 | Production Build موفق باشد. | Production build of final source | Client and worker artifacts generated | PASS — isolated technical |
| FIN07-57 | Migration جدید، در صورت نیاز، روی پایگاه ایزوله اجرا شود. | All migrations on disposable D1 | 0024 applies successfully | PASS — isolated technical |
| FIN07-58 | داده و تاریخچه قبلی پس از Migration حفظ شوند. | Pre-0024 historical negative opening, entry and receipt fixture | Original values/source/history and integrity preserved | PASS — isolated technical |
| FIN07-59 | تمام آزمون‌های رگرسیون مالی مرتبط اجرا شوند. | FIN04, FIN05, FIN06, dashboard, finance core and legacy petty suites | Related isolated regressions pass | PASS — isolated technical |
| FIN07-60 | ثبت تکراری، درخواست هم‌زمان و نسخه قدیمی کنترل شوند. | Stable create key, concurrent revision and reload after logout/login | Canonical source survives new session; expired session denied | PASS — isolated backend |
