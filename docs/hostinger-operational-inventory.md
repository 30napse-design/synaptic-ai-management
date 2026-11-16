# موجودی لازم برای انتقال مستقل SYNAPSE — ادامه بسته پنجم

این سند فهرست پیش‌نیاز است، نه ادعای تحویل بکاپ یا شروع مهاجرت. روش‌های قبلی در `docs/independent-runtime-fa.md` و `docs/package5-independent-connectors.md` حفظ می‌شوند.

| جزء | محل/قرارداد فعلی | اقدام لازم در مقصد |
| --- | --- | --- |
| سورس و Build | GitHub خصوصی؛ Vinext/Worker، lockfile و اسکریپت‌ها | دریافت SHA دقیق منتشرشده، نصب نسخه‌های قفل‌شده و Build |
| داده عملیاتی | D1، binding `DB`؛ schema و Migrationهای موجود در `drizzle/` | خروجی کامل سازگار، حفظ شناسه‌ها/روابط/نسخه‌ها؛ تعیین SQLite یا PostgreSQL و adapter سازگار پیش از انتقال |
| حساب و نشست | staff_accounts، staff_sessions، staff_members، انتصاب سمت‌ها و history | حفظ IDها؛ انتقال امن pepper یا برنامه بازنشانی مصوب؛ هیچ اعتماد به header دلخواه کاربر در مقصد |
| فایل خصوصی | R2، binding `BUCKET`؛ work/science/laboratory/finance/knowledge object keys در DB | خروجی کامل bytes، object_key، MIME و metadata؛ مقصد S3-compatible یا ذخیره خصوصی با همان کنترل مجوز |
| دریافت و گردش | ops_items، ops_communications، research_orders/people، workflow links، tasks و notifications | همان موتور و شناسه‌ها؛ callbackها و URL پایه با دامنه مقصد؛ کنترل تکرار مشترک حفظ شود |
| تنظیمات منابع | staff_auth_settings: input-source/input-health/input-oauth | حفظ cursor و تاریخ شروع؛ OAuth state موقت لازم نیست به‌عنوان اتصال فعال منتقل شود |
| زمان‌بند فعلی | task ابری ساعتی ChatGPT، شناسه در گزارش تحویل | وابستگی به ChatGPT؛ در مقصد با cron خصوصی و `/api/integrations/tick` جایگزین و واقعاً آزمون شود |
| Secrets احراز هویت | `STAFF_AUTH_PEPPER`، تنظیم provisioning موجود | مقدار فقط از مسیر رسمی امن؛ نه Git/گزارش عمومی. provisioning منقضی در مقصد فعال نشود |
| Secret رمزگذاری تنظیمات | `SYNAPSE_INTEGRATION_KEY` | حفظ امن همان کلید برای رمزگشایی OAuth/API keys؛ در صورت نبود خروجی رسمی، بازاتصال مصوب به‌جای ادعای بازیابی |
| OAuth گوگل | `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET`؛ فعلاً فراهم نیست | Web client، consent و scopeهای فقط‌خواندنی Gmail/Sheets؛ ثبت callback دامنه جدید، رضایت حساب‌های دقیق |
| cron مستقل | `SYNAPSE_AUTOMATION_TOKEN`؛ فعلاً تنظیم نشده | Secret مستقل و header مجاز؛ اجرای دوره‌ای، logs و هشدار شکست/باقی‌ماندن backlog |
| اتصالات بومی ChatGPT | چهار Gmail، Drive و MCP مالک | قابل انتقال به‌صورت token از این ابزار نیستند؛ OAuth یا سرویس استاندارد مستقل جایگزین شود |
| پیام‌رسان/IMAP/SMTP/تلفن | پورت مشترک امضاشده آماده؛ provider مستقل فعال نیست | انتخاب سرویس قانونی، کلید و امضای مستقل، idempotency و receipt واقعی؛ ارسال مجاز انسانی حفظ شود |
| AI اختیاری | adapter فعلی و نام‌های `OPENAI_API_KEY` و `SYNAPSE_AI_*` در env نمونه | برای شروع مهاجرت ضروری نیست؛ بدون خرید/فعال‌سازی جدید. تنظیمات دانش/قیمت محرمانه‌اند |
| دامنه، TLS و داده‌برداری | مبدأ chatgpt.site؛ هیچ انتقالی انجام نشده | تعیین VPS/Node/container سازگار، دامنه و TLS، انتقال آزمایشی و کنترل کامل پیش از تغییر DNS |

Hostinger shared/PHP hosting به‌تنهایی Worker دارای `cloudflare:workers` و bindingهای D1/R2 را اجرا نمی‌کند. باید runtime مقصد و adapterهای داده/فایل/هویت انتخاب شوند؛ سورس آماده بازیابی است، اما انتقال عملیاتی هنوز آماده یک‌کلیک نیست. فایل ZIP سورس جای خروجی DB و فایل خصوصی را نمی‌گیرد. هیچ Secret واقعی یا داده مشتری در این فهرست وجود ندارد.
