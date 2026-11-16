# SYNAPSE — مرجع سورس و پیکربندی اجرای مستقل

تاریخ: ۲۰۲۶-۱۱-۱۶. مبنای اجرایی بسته دوم:
`eebc281b9863b85ada374553245e79b8258d2fbb`، نسخه زنده ۴۳.
این تحویل فقط ثبت سورس و مستندات است؛ کد اجرایی، دیتابیس، Secrets و انتشار تغییر نمی‌کنند.
تکمیل و انتشار بسته دوم با تأیید نهایی مالک یکی نیست؛ تأیید مالک هنوز ثبت نشده است.

## اجزای در اختیار و ثبت‌شده

| مسیر | محتوای قابل بازسازی |
| --- | --- |
| `app/` | صفحات Frontend، APIهای Backend، احراز هویت و فرم‌ها |
| `components/` | رابط‌ها، فرم‌ها، سربرگ و اجزای مشترک |
| `lib/` | موتورهای موجود مالی، علمی، آزمایشگاهی، وظایف، ارتباطات و ارجاع؛ سیاست‌ها و قراردادهای اتصال |
| `lib/org-role-catalog.ts` و `lib/organizational-logins.ts` | منبع نقش‌ها، وظایف و نام‌های ورود مصوب؛ داده حساب زنده نیستند |
| `db/` | اتصال D1 و مدل Drizzle |
| `drizzle/` | تمام ۲۲ Migration موجود `0000–0021` و فراداده‌های موجود؛ SQL مبنای بازسازی جدول‌های افزوده است |
| `scripts/` | ابزارهای نصب، ساخت، اجرای محلی، پیش‌نمایش اتصال‌ها و آزمون‌های موجود |
| `worker/` و `scripts/vite/` | ورودی Worker و یکپارچه‌سازی Vinext، Vite و میزبان |
| `public/` | دارایی‌های ثابت در اختیار پروژه |
| فایل‌های ریشه | `package.json`، `pnpm-lock.yaml`، `.npmrc`، تنظیمات TypeScript، Vite، Drizzle، ESLint و PostCSS و تعاریف نوع‌ها |
| `.openai/hosting.json` | شناسه غیرمحرمانه سایت، نام bindingهای DB و BUCKET و قابلیت mcp؛ مجوز دسترسی به این منابع نیست |
| `docs/` | راهنماهای قبلی ماژول‌ها، تحویل بسته‌ها، سیاست نسخه‌بندی و این مرجع |

فهرست دقیق تمام فایل‌های این تحویل و SHA-256 آن‌ها در
`docs/source/package2-source-manifest.json` قرار دارد. خود manifest برای جلوگیری از checksum خودارجاع از فهرستش مستثناست.
تاریخچه Git بخشی از مخزن خصوصی است؛ پوشه `.git` را در آرشیو فایل‌های برنامه یا میزبان عمومی قرار ندهید.
`node_modules`، خروجی `dist`، کش‌ها و وضعیت محلی، Secretها، دیتابیس و فایل‌های خصوصی کاربران جزو سورس نیستند.
فایل قفل pnpm حفظ شده است؛ نصب را با npm و ساخت lockfile موازی جایگزین نکنید.

## ساخت از کلون پاک

۱. مخزن خصوصی را با دسترسی مجاز دریافت و Commit یا برچسب موردنظر را checkout کنید.
مرجع زنده و مرجع مستندات را از شناسنامه نسخه جدا بخوانید؛ `main` الزاماً آخرین نسخه منتشرشده نیست.

۲. ابتدا `node scripts/verify-source-manifest.mjs` را اجرا کنید.
این بررسی در سورس استخراج‌شده نیز بدون Git کار می‌کند. در checkout، فایل‌های tracked جامانده را هم شناسایی می‌کند.
برای توسعه بعدی، manifest همین snapshot را به‌عنوان مرجع تاریخی نگه دارید یا در تحویل نسخه مهم بعد به‌روز کنید.

۳. Node.js مطابق `package.json`، حداقل `22.13.0` و pnpm دقیق `11.25.0` فراهم کنید.
آزمون‌های SQLite از `node:sqlite` استفاده می‌کنند و به Node دارای این ماژول نیاز دارند.
در محیط عمومی، نصب قفل‌شده: `pnpm install --frozen-lockfile`.
در محیط مدیریت‌شده موجود، همان `pnpm run install:ci` و ابزارهای نصب موجود استفاده شوند؛ نیازمند Bash، flock و GNU timeout هستند.
پروفایل پاک پیش‌فرض `portable` است؛ تنظیم محلی `.sites-runtime/execution-profile.json` عمداً در Git نیست.

۴. `pnpm run build` خروجی `dist/` و تنظیم تولیدشده Worker را می‌سازد؛
`pnpm run dev` توسعه و `pnpm start` پیش‌نمایش Worker ساخته‌شده روی loopback است.
هیچ‌کدام به‌تنهایی استقرار در هاست عمومی یا فعال‌شدن دیتابیس مقصد نیست.
فرمان ساخت موجود، `vinext` است؛ پروژه را صرفاً با `next start` یا هاست اشتراکی PHP اجراپذیر فرض نکنید.

۵. Secrets و bindingهای مقصد جداگانه و فقط سمت سرور پیکربندی شوند.
`.env.example` فهرست مستند است، نه تنظیم خودکار Worker؛ بارگذاری env باید مطابق runtime مقصد انجام شود.
در پیش‌نمایش Wrangler از فایل محلی و ignored مانند `.dev.vars` استفاده کنید؛ آن را Commit نکنید.

۶. برای دیتابیس **خالی و مستقل آزمایشی**، Migrationهای SQL به‌ترتیب شماره و فقط یک بار اجرا شوند؛
Drizzle schema جایگزین تمام SQLهای تاریخی نیست. مثال محلی بعد از Build:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_warm_ricochet.sql
```

مثال بالا اولین فایل واقعی این snapshot است؛ فایل‌های بعدی از فهرست همان پوشه به‌ترتیب انتخاب می‌شوند.
این دستور در این تحویل اجرا نشده است. برای دیتابیس دارای اطلاعات، ابتدا دفتر ثبت Migration مقصد را تطبیق دهید؛ بازپخش همه SQLها مجاز نیست.
فایل `drizzle/meta/_journal.json` و snapshots موجود حفظ شده‌اند؛ داده عملیاتی نیستند.

۷. آزمون‌های موجود مستقل از داده مشتری اجراپذیرند، از جمله:
`node scripts/test-nine-accounts-final.mjs` و `node scripts/test-package2-communications.mjs`.
آزمون‌های مرورگر در `scripts/test-home-browser.mjs` به Playwright و Chromium موجود در مقصد نیاز دارند؛
مسیرهای پیش‌فرض محیط فعلی روی هاست دیگر معتبر فرض نشوند؛ از `PLAYWRIGHT_MODULE` و `CHROMIUM_PATH` استفاده کنید.
ابزار `scripts/package2-live-acceptance.mjs` آزمون صرفاً خواندنی نیست و رکورد ساختگی می‌نویسد؛ بدون مجوز روی محیط عملیاتی اجرا نشود.

## تنظیمات برنامه و Secretها؛ فقط نام و کاربرد

| نام | کاربرد و شرط |
| --- | --- |
| `STAFF_AUTH_PEPPER` | Secret الزامی برای هش رمز و رمزگشایی تحویل رمزهای اولیه؛ `lib/staff-auth.ts` و `lib/package1-activation.ts` |
| `STAFF_ACCOUNT_SETUP_TOKEN` | ورودی قدیمی ایجاد چهار حساب اولیه؛ در راه‌اندازی معمول نه حساب لازم نیست؛ خالی بماند |
| `STAFF_OPS_SETUP_TOKEN` | مجوز server-to-server برای `POST /api/ops/import` با هدر `x-synapse-ops` |
| `SYNAPSE_PROVISION_REQUEST` | مجوز JSON منقضی‌شونده، هش توکن و بدنه دقیق برای `/api/auth/provision-request`؛ مقدار واقعی خارج Git، پیش‌فرض غیرفعال |
| `OPENAI_API_KEY` | Secret ارائه‌دهنده مدل؛ فقط سرور و با مجوز جداگانه |
| `SYNAPSE_AI_ENABLED`, `SYNAPSE_AI_PROVIDER`, `SYNAPSE_AI_MODEL` | فعال‌سازی صریح، ارائه‌دهنده و مدل معتبر؛ پیش‌فرض غیرفعال |
| `SYNAPSE_AI_MAX_OUTPUT_TOKENS` | سقف خروجی مدل؛ در کد فعلی عدد صحیح ۶۴ تا ۲۰۰۰ |
| `SYNAPSE_AI_DAILY_REQUESTS`, `SYNAPSE_AI_GLOBAL_DAILY_REQUESTS` | سقف‌های مثبت مصوب مصرف کاربر و مجموع؛ بدون مقدار خودکار جدید |
| `SYNAPSE_AI_REQUEST_RESERVE_USD`, `SYNAPSE_AI_DAILY_BUDGET_USD` | ذخیره بودجه هر درخواست و بودجه روزانه مصوب؛ برآورد هزینه داخلی، نه گزارش صورتحساب ارائه‌دهنده |

مقادیر واقعی هیچ‌کدام در این تحویل استخراج یا تغییر داده نشده‌اند.
انتقال حساب‌های موجود با هش رمز، بدون حفظ امن pepper قبلی، ورود معتبر را حفظ نمی‌کند؛
تغییر pepper همچنین صندوق رمزهای اولیه را غیرقابل رمزگشایی می‌کند. مقصد تازه بدون اطلاعات قبلی به Secret تازه و راه‌اندازی مجاز حساب‌ها نیاز دارد.
نشست‌ها در `staff_sessions` و سیاست cookie امن/HttpOnly/SameSite در `lib/staff-auth.ts` هستند؛ نام و شناسه داخلی حساب‌ها نباید با انتقال عوض شوند.

## وابستگی‌های اختصاصی میزبان و قرارداد مقصد

| وابستگی فعلی | قرارداد در سورس | نیاز مقصد؛ هنوز انجام نشده |
| --- | --- | --- |
| `cloudflare:workers` و binding شیء `DB` | `db/index.ts`، `lib/staff-server.ts`؛ `prepare().bind().first()/all()/run()` و batch با رفتار سازگار | Worker/D1 در حساب مستقل یا adapter آزموده برای runtime و SQL مقصد؛ env متنی `DATABASE_URL` در کد فعلی وجود ندارد |
| binding شیء `BUCKET`، R2 | APIهای `*/files` و `profile/avatar`؛ `get/put/delete`، body و metadata | R2 مستقل یا adapter شیء سازگار، خصوصی؛ صرف نام bucket یا URL کافی نیست |
| `CONNECTORS` در زمینه درخواست | `worker/index.ts`، `lib/connector-context.ts`، `lib/connector-contract.mts`؛ `getContext()` و `invoke(connectorId,actionName,args)` | میزبان فعلی capability و مجوز را تزریق می‌کند؛ قرارداد و preview در Git هستند، سرویس مدیریت‌شده و OAuth tokenهایش در سورس نیستند |
| ChatGPT sign-in و هدرهای اعتمادشده | `app/chatgpt-auth.ts`، `lib/staff-server.ts` و سیاست مسیرهای رزروشده در README | مسیرها و هویت میزبان باید با احراز هویت رسمی مقصد جایگزین/پیکربندی شوند؛ هدرهای ورودی کاربر قابل اعتماد نیستند. ورود محلی کارکنان مستقل در سورس موجود است |
| ChatGPT Sites Publish و project_id | `.openai/hosting.json`، Vite plugin و scripts موجود | کنترل‌پلین انتشار، تنظیمات اشتراک و تزریق منابع میزبان قابل انتقال با کپی فایل نیست؛ در مقصد pipeline مستقل لازم است |
| Runtime سازگار Vinext/Workers | `worker/index.ts`، Vite و package lock | دامنه/TLS، reverse proxy و پشتیبانی runtime باید انتخاب شوند؛ هاست دلخواه بدون بررسی سازگاری تضمین نمی‌شود |
| زمان‌بندی پیگیری | کد بسته دوم هنگام استفاده از برنامه هشدارها را بررسی می‌کند | زمان‌بند پس‌زمینه جدیدی فعال نشده؛ در صورت نیاز آینده سرویس زمان‌بندی مجاز مقصد لازم است |

کلید API یا credentialهای اتصال میزبان در Git نیست و اتصال حساب‌ها با clone منتقل نمی‌شود.
نه برقراری مستقل این سرویس‌ها و نه آزمون استقرار روی هاست پژوهشکده در این مرحله ادعا نمی‌شود.

## قرارداد ارتباطات، فایل‌ها و سرویس‌های بیرونی

- **درخواست و ارجاع:** `lib/dispatch-policy.ts` منبع ۱۸ خانواده، `lib/dispatch-engine.ts` موتور همان `ops_items` و وظایف موجود است.
  `ops_communications` ارتباطات چندگانه هر درخواست را نگه می‌دارد؛ موتور CRM یا نقش موازی ایجاد نشده است.
  نقش اصلی به انتصاب فعال `workflow_position_assignments` وصل است؛ تعاریف نه حساب و شناسه‌های پایدار از کد فعلی حفظ می‌شوند.
  جزئیات قراردادها، idempotency، مجوزها و محدودیت‌ها در `docs/package2-communications-routing.md` موجود است.
- **ایمیل و تماس:** importer موجود `lib/ops-server.ts` در `/api/ops/import` ورودی مجاز و sourceKey پایدار با پیشوندهای `gmail:synapticsite:` یا `calls:incoming:` می‌پذیرد؛ هر batch حداکثر ۱۰۰ مورد.
  ثبت دستی سایر کانال‌ها در موتور موجود است؛ این به معنای OAuth، دریافت خودکار Gmail یا ارسال فعال WhatsApp/SMS نیست.
  مقصد باید credential/OAuth، محدوده دسترسی، شناسه پیام و مجوز کانال را جدا تنظیم کند؛ provider actionها از قرارداد CONNECTORS بازیابی و اعتبارسنجی شوند، نه نام فرضی.
- **آزمایشگاه:** `lib/lab-execution-*` و APIهای laboratories، داده/پیام/صورت‌وضعیت همان سفارش را به موتور ارجاع متصل می‌کنند؛ شرح سفارش مجری معادل فاکتور مشتری نیست.
  اتصال به اطلاعات آزمایشگاه و کاربران آن، داده دیتابیس است و جزو سورس قابل بازتولید خودکار نیست.
- **فایل:** جدول‌های فایل و `object_key` پیوند خصوصی با storage دارند؛ نام فایل، mime، size، ایجادکننده، رکورد مرجع و metadata لازم است.
  مسیرها شامل `work/`، `laboratory-results/` و `profile-avatar/` هستند و مسیر دقیق سایر ماژول‌ها در API همان ماژول موجود است.
  فایل‌های واقعی در مخزن قرار نمی‌گیرند؛ برای بازیابی داده در آینده object_key، metadata و شناسه رکورد حفظ شوند. سورس جایگزین این داده‌ها نیست.
- **AI:** `lib/assistant-provider.ts` از API رسمی Responses و `/api/assistant` استفاده می‌کند؛ با `SYNAPSE_AI_ENABLED=false` اتصال خارجی خاموش می‌ماند.
  پایگاه دانش حداقلی در `lib/assistant-policy.ts` موجود است؛ ورود انبوه اسناد یا RAG خارجی از قبل فعال فرض نشود.
- **پیش‌نمایش connector:** `scripts/connector-preview/` و Vite plugin موجود ابزار توسعه‌اند؛ اطلاعات نشست محلی ignored است و در تولید استفاده نمی‌شود.

## نسخه، برچسب و ادامه پنج بسته

- سورس اجرایی منتشرشده بسته دوم: Commit بالا، نسخه ۴۳؛ شناسنامه در `docs/source/package2-release.json`.
- این تحویل فقط مستندات/manifest است؛ Commit آن را با `git rev-parse HEAD` مشخص کنید و با Commit زنده اشتباه نگیرید.
- نام برچسب snapshot سورس: `synapse-package2-v43-source-2026-11-16`؛ ثبت محلی برچسب به معنای ثبت آن در GitHub نیست.
- در ابزار GitHub این نشست، ایجاد blob/tree/commit/branch در دسترس است؛ ایجاد tag/ref از نوع tag ارائه نشده و CLI/مرورگر نشست ورود GitHub ندارند.
  بنابراین وضعیت برچسب remote تا تأیید واقعی آن، pending است. از ساخت branch با اسم شبیه tag به‌عنوان جایگزین استفاده نشود.
- برای ثبت برچسب از clone مجاز مالک، ابتدا SHA نهایی این تحویل را با GitHub تطبیق دهید، سپس:

```sh
git tag -a synapse-package2-v43-source-2026-11-16 <FINAL_SOURCE_COMMIT> -m "SYNAPSE package 2 source snapshot; runtime v43 eebc281"
git push origin refs/tags/synapse-package2-v43-source-2026-11-16
git ls-remote --tags origin refs/tags/synapse-package2-v43-source-2026-11-16 refs/tags/synapse-package2-v43-source-2026-11-16^{}
```

برچسب موجود را بازنویسی نکنید. برای بسته‌های بعد، فقط پس از تکمیل واقعی، همان الگوی شناسنامه، SHA و برچسب مستقل استفاده شود؛
شماره نسخه زنده، Commit توسعه و وضعیت تأیید مالک جدا بمانند. بسته سوم در این تحویل آغاز نشده است.
