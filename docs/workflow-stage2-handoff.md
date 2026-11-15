# SYNAPSE — تحویل مرحله دوم مدل مرکزی گردش کار

وضعیت: Backend/API قابل تست؛ نه انتشار، فعال‌سازی زنده یا انتقال داده تاریخی.

- مبنای صریح مالک: `integration/work-codex-2026-11-15` / `e6b72ecd8b9bd3768683935177de4c69bf5103e8`.
- شاخه توسعه: `feature/workflow-stage2-2026-11-15`.
- همه ۲۴ فایل Work/ادغام نسبت به مبنا یکسان مانده‌اند؛ سربرگ، حساب، دستیار، جست‌وجو و اعلان‌های Work بازنویسی نشده‌اند.
- هیچ تغییر main، انتشار Sites، Migration زنده، داده واقعی، R2، Secret یا حساب کارکنان انجام نشده است.

## مدل و مرجع داده

| جدول افزوده | مسئولیت |
|---|---|
| `research_people` | شناسنامه دائمی محقق با UUID پایدار، تماس نرمال‌شده و Revision |
| `research_orders` | سفارش با شناسه/کد پایدار، محقق، سمت مسئول، محدوده، اقدام بعدی، موعد و وضعیت |
| `workflow_positions` | تعریف مستقل سمت؛ ۱۱ سمت پایه بدون انتصاب شخص واقعی |
| `workflow_position_assignments` | مسئول اصلی و جانشین فعال هر سمت/محدوده؛ چند سمت برای یک فرد مجاز است |
| `workflow_order_links` | ارتباط نوع‌دار با شناسه سوابق موجود؛ کنارگذاشتن مستند ارتباط به‌جای حذف تاریخچه |

فاکتور، نسخه اصلاحی، دریافت، نمونه، خدمت آزمایشگاه، پروژه، وظیفه و نتیجه در جداول قبلی باقی می‌مانند. گراف ارتباط فقط شناسه‌های صریح و روابط واقعی والد/فرزند را دنبال می‌کند؛ نام، شماره تلفن یا متن مرجع، دلیل ادغام نیستند. نسخه‌های مالی و علمی و نتایج قدیمی حفظ و قابل پیگیری‌اند. پروژه مشترک بین سفارش‌ها مجاز است، اما اشتراک سند مالی یا خانواده خدمت/پرونده علمی بین سفارش‌های متفاوت بدون تعیین تکلیف، با 409 رد می‌شود.

UUID و create_key محقق/سفارش پایدارند. تکرار همان درخواست حتی بعد از ویرایش رکورد، شناسه قبلی را برمی‌گرداند و داده ویرایش‌شده را بازنویسی نمی‌کند. تماس تکراری بالقوه نیازمند انتخاب شناسنامه موجود یا دلیل صریح اشتراک تماس است؛ افراد دارای تلفن مشترک خودکار ادغام نمی‌شوند.

## مسئولیت و دسترسی

- مسئول فعلی از سمت و محدوده تعیین می‌شود، نه نام ثابت شخص. سمت‌های پایه شامل چهار مسئولیت علمی تأییدشده‌اند؛ سمت اجرایی آزمایشگاه برای خدمت واحد خودش است، نه مالک کل سفارش.
- جانشین با انتخاب مدیریت فعال می‌شود؛ در نبود مسئول اصلی واجد شرایط نیز جانشین واجد مجوز انتخاب می‌شود. غیرفعال‌شدن فرد یا لغو مجوز، در خواندن بعدی لحاظ می‌شود.
- انتصاب سمت هیچ مجوز مالی/علمی جدیدی به حساب نمی‌دهد. مجوز واقعی، فعال‌بودن فرد و محدوده آزمایشگاه کنترل می‌شوند. حساب آزمایشگاه به شناسنامه مرکزی مشتری دسترسی ندارد و از پرتال فعلی خودش استفاده می‌کند.
- سفارش بدون مسئول مؤثر در صف بررسی مدیریتی قرار می‌گیرد. اقدام بعدی، موعد معتبر و وضعیت از ابتدا اجباری‌اند؛ حالت خالی پنهان یا مسئول ساختگی تولید نمی‌شود.
- ایجاد شناسنامه/سفارش، تعریف سمت، انتصاب، تطبیق و کنارگذاشتن ارتباط با مدیریت است. مسئول فعلی می‌تواند پیگیری پرونده خودش را به‌روز کند؛ انتقال مسئولیت و اختتام مدیریتی باقی می‌مانند.
- دسترسی موجود به رکوردهای قدیمی حذف نمی‌شود. دسترسی مرکزی از مسئول فعلی یا مجوز معتبر به رکورد مرتبط ناشی می‌شود؛ داده مالی/علمی فقط طبق سیاست API اصلی خودش نمایش داده می‌شود. انتقال سمت به‌تنهایی مسئول قدیمی وظایف و تاریخچه آن‌ها را بازنویسی نمی‌کند.

## API موجود؛ بدون صفحه یا ماژول موازی

همه عملیات مرکزی از `/api/operations` فعلی عرضه شده‌اند؛ UI مستقل جدیدی ایجاد نشده است.

خواندن:

- `GET ?view=researchers` برای مدیریت؛ `?view=researchers&id=<researcherId>` برای پرونده مجاز.
- `GET ?view=orders&id=<orderId>`: شناسنامه، مسئول فعلی، سوابق مجاز و تاریخچه سفارش؛ تاریخچه کامل ارتباط‌ها برای مدیریت.
- `GET ?view=orders&queue=management`: صف فاقد مسئول مؤثر، فقط مدیریت.
- `GET ?view=orders&limit=25&cursor=<offset>`؛ مجوز پیش از صفحه‌بندی اعمال می‌شود.
- `GET ?view=positions`: سمت‌ها و انتصاب‌های فعلی، فقط مدیریت.

نوشتن، با نشست سازمانی و Origin/Content-Type معتبر:

```json
{"action":"researcher_save","create_key":"<stable-request-key>","name":"<name>","phone":"<phone>","email":"<email>","organization":"<organization>"}
```

```json
{"action":"order_save","create_key":"<stable-request-key>","researcher_id":"<id>","title":"<title>","current_position_id":"scientific_design","next_action":"<next-action>","follow_up_date":"YYYY-MM-DD","status":"awaiting_order_confirmation"}
```

```json
{"action":"position_assign","position_id":"scientific_design","primary_member_id":"<active-member-id>","substitute_member_id":"<active-member-id>","use_substitute":0,"scope_type":"institute","scope_id":""}
```

```json
{"action":"order_link","order_id":"<id>","revision":0,"target_type":"finance_document","target_id":"<existing-document-id>","reason":"<verified-matching-reason>"}
```

برای ویرایش، id و Revision جاری لازم است. `position_save` برای تعریف/فعال‌بودن سمت، `position_assign` برای ویرایش انتصاب و `order_link_retire` با id ارتباط، Revision جاری سفارش و دلیل، برای اصلاح مستند اتصال موجودند. هیچ API حذف فیزیکی اضافه نشده است. انواع ارتباط: operation، finance_document، finance_version، payment، lab_job، sample، lab_result، project، task، correspondence، science_case، science_result.

وضعیت مرکزی، وضعیت پیگیری است؛ جایگزین تأیید مالی، پذیرش خدمت، کنترل علمی یا مجوز تحویل نیست. کنترل‌های مرحله اول دست‌نخورده‌اند. مسیرهای موجود مالی/علمی هنگام ایجاد ارتباط نیز تعارض سفارش را بررسی می‌کنند؛ کنترل Revision و SQL داخل batch، از اتصال مبتنی بر گراف قدیمی جلوگیری می‌کند.

## اتصال به مرحله سوم

تغییرات مدل در `staff_events` موجود، همراه actor واقعی و زمان، به‌صورت تراکنشی ثبت می‌شوند. قرارداد payload شامل `schema_version:1`، `aggregate_type`، `aggregate_id`، `aggregate_revision` و `change` است. رویدادهای `workflow.v2.*.changed` و شناسه یکتای رویداد، نقطه اتصال مصرف‌کننده مرحله سوم هستند. `resolveWorkflowOwner` جایگاه فعال را حل می‌کند. هیچ polling، Gmail، صف ارسال، Scheduler، Outbox عملیاتی، ارجاع خودکار وظیفه یا طبقه‌بندی AI در این مرحله اجرا نشده است.

## Migration و انتقال هاست

فایل: `drizzle/0018_central_research_workflow.sql`، با schema و metadata سازگار Drizzle. فقط پنج جدول، indexها، سمت‌های بدون انتصاب و محافظ‌های ارتباط/تاریخچه اضافه می‌شوند. هیچ سوابق قدیمی کپی، اصلاح، حذف یا خودکار به محقق انتساب داده نمی‌شود. حذف رکوردی که ارتباط مرکزی دارد، حتی بعد از کنارگذاشتن ارتباط، برای حفظ تاریخچه مسدود است.

SHA-256 فایل SQL: `2ec0720f40b155760a15a47ab36d5b59684de29d66862bb5d7534ae2b59f27f6`

قبل از اجرای مصوب، محیط بررسی جدا با آخرین Schema و داده آزمایشی آماده شود؛ SQL در تراکنش/ابزار migration استاندارد اجرا، FKها و شمارش/نمونه داده‌های قبلی کنترل شوند. این تحویل خودش هیچ دستور apply علیه دیتابیس زنده اجرا نکرده است. قبل از Migration، APIهای مرکزی 503 می‌دهند و Schema را خودکار نمی‌سازند.

برای انتقال مستقل، SQLite/D1 و JSON1، قیود، triggerها، تاریخچه موجود و رفتار اتمیک batch باید حفظ شوند. بازگشت نسخه کد پس از شروع استفاده، نیازمند توقف نوشتن مرتبط و حفظ جداول/تاریخچه جدید است؛ حذف کور جداول، rollback ایمن نیست. snapshot SQL/متادیتا، پشتیبان دیتابیس یا فایل‌های واقعی نیست.

## آزمون واقعی

- Build و TypeScript موفق.
- ۳ تست SQLite: داده‌های قبلی بدون تغییر؛ قیود/عدم حذف تاریخچه؛ rollback خطای نصب در تراکنش؛ تعریف همه جداول قبلی در snapshot Drizzle یکسان.
- ۱۵۷ بررسی HTTP مرحله دوم: شناسه پایدار و retry، چند خدمت، دو پرداخت، چند نمونه و ۱۲۳ نمونه در خواندن گراف، تغییر مسئول/جانشین، نبود تغییر مجوز حساب‌ها، نقش غیرمجاز، حساب آزمایشگاه، تعارض و ثبت هم‌زمان، جهت معکوس اتصال پرونده علمی و حفظ تاریخچه.
- ۹۷ بررسی HTTP مرحله اول و چرخه کامل مالی، تطبیق بانک، پیوست خصوصی، استرداد، پرداختنی و تراز دفتر موفق.
- ۵۴ بررسی API/SSR ابزارهای Work موفق؛ سرچ، اعلان، مکاتبه، حساب، آواتار، رمز/نشست و مرز دستیار بدون مدل پولی.
- ۶ بررسی قبل از Migration: viewهای جدید و ثبت مرکزی 503، خواندن عملیات و مالی قبلی 200، بدون ساخت خودکار جدول.
- شش فایل تست سیاست مالی/دسترسی/علمی/آزمایشگاه/ارجاع موفق.

فرمان‌های محلی:

```sh
npm run build
node node_modules/typescript/bin/tsc --noEmit --incremental false
python3 tests/workflow-migration.test.py
node scripts/test-finance-runtime.mjs finance-runtime.mjs workflow-stage1-runtime.mjs workflow-stage2-runtime.mjs
node scripts/test-finance-runtime.mjs --before-workflow workflow-before-migration-runtime.mjs
node scripts/test-shared-tools-runtime.mjs
```

همه آزمون‌ها روی SQLite حافظه‌ای یا Miniflare با D1/R2 موقت، هویت و داده ساختگی اجرا شدند؛ سرویس مالی/ایمیل یا مدل پولی فراخوانی نشد.

## باقی‌مانده تا فعال‌سازی

۱. تأیید و اجرای جداگانه Migration در محیط مصوب؛ سپس تنظیم سمت‌ها و جانشین‌های واقعی توسط مدیریت.
۲. تطبیق انسانی سوابق تاریخی و بررسی موارد مبهم؛ هیچ Backfill حدسی اجرا نشده است.
۳. اتصال رویدادها، دریافت خودکار ورودی‌ها و ارجاع به کارتابل در مرحله سوم؛ هنوز اجرا نشده‌اند.
۴. توسعه این مرحله Backend/API است؛ نمایش این مدل در فرم‌های موجود، بدون صفحه موازی، باید در تحویل رابط/مرحله بعد مشخص شود.

## فایل‌های تغییرکرده

- `app/api/finance/route.ts`
- `app/api/laboratories/route.ts`
- `app/api/operations/route.ts`
- `app/api/science/route.ts`
- `db/schema.ts`
- `docs/workflow-stage2-handoff.md`
- `drizzle/0018_central_research_workflow.sql`
- `drizzle/meta/0018_snapshot.json`
- `drizzle/meta/_journal.json`
- `lib/finance-write.ts`
- `lib/lab-execution-write.ts`
- `lib/science-write.ts`
- `lib/workflow-core.ts`
- `lib/workflow-policy.ts`
- `lib/workflow-records.ts`
- `scripts/test-finance-runtime.mjs`
- `tests/workflow-before-migration-runtime.mjs`
- `tests/workflow-migration.test.py`
- `tests/workflow-stage2-runtime.mjs`
