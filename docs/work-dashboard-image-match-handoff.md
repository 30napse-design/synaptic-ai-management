# SYNAPSE — Pixel-reference implementation / 1536 × 1024
**Owner-approved screenshot is the visual source of truth. Attach the same screenshot to the integrating agent.**
Repo `30napse-design/synapse-ai-management`
Branch `feature/work-dashboard-pixel-reference-2026-11-23`
Parent `feature/unified-work-planning-dashboard-2026-11-23`
Route `/staff?view=dashboard`
No main merge or release without owner approval.

## Reference screenshot precise screen map (pixel coordinates at 1536×1024)
The reference screenshot shows a dark institutional top header, LEFT fixed navy sidebar, bright pale-blue main area. Coordinates are approximate bounds in the screenshot and should be refined from visual comparison, not treated as literal viewport pixels on all device sizes.

1. **Global header:** x=0…1536, y=0…68, midnight blue (#0E315D / #123D70), luminous neuron graphics center, SYNAPSE Command Center wordmark on the LEFT, bilingual institute name near x=260; near RIGHT: purple neon AI, yellow notification bell, green correspondence, settings, name in Persian and English organizational title below and round user portrait. **Do not create a second header:** styling applied to real `WorkspaceShell` and real `HomeToolbar`; an original decorative SVG is `public/brand/synapse-neural-header.svg`. New institute title is rendered only on the reference dashboard route. Real auth and avatar controls remain in the shared components.
2. **Sidebar:** x=0…185, y=68…1024, deep navy (#10396F), under the header, navigation labels in white and active `کارتابل و برنامه‌ریزی` cyan-blue highlight. Existing actual allowed navigation links and permissions MUST remain. Do not clone the sidebar inside page. `workspace-repair.css` scopes reference geometry to the dashboard route and leaves mobile drawer behavior.
3. **Page heading:** x≈203…1535, y≈69…158; pale-blue background, small calendar icon x≈211, H1 **کارتابل و برنامه‌ریزی**, subtitle **مدیریت وظایف، برنامه‌ها، تیکت‌ها و مکاتبات سازمانی**.
4. **Four PRIMARY oversized pastel cards:** x≈208…1524, y≈160…260, 4 equal columns with 12px gap, **right→left**:
   - rightmost: **مکاتبات داخلی**, purple, envelope icon, subtitle **مکاتبات بین واحدها و تاریخچه**;
   - next: **بررسی و تأیید**, amber/gold, shield-check, subtitle **درخواست‌ها و موارد نیازمند تأیید**;
   - next: **کارتابل وظایف**, sky blue, clipboard, subtitle **همه وظایف، وظایف امروز، برد وظایف**;
   - leftmost: **برنامه‌ریزی**, mint/teal, calendar, subtitle **تقویم، برنامه‌های روزانه و آتی**.
   Each card button actually selects a meaningful section; no inert visuals. Do NOT copy typo `بررسی و بررسی` from illustrative screenshot: user's approved final text is **بررسی و تأیید**.
5. **Six STATUS compact cards:** y≈283…347, x≈208…1524; 6 equal columns from right→left: **همه موارد** (blue), **جدید** (purple), **امروز** (green), **منتظر اقدام** (amber), **موعد گذشته** (coral), **بدون مسئول** (gray/slate). Real records per authorized user; unassigned visible to authorized management ONLY. Metrics overlap (not arithmetic parts); no fabricated screenshot counts.
6. **Central work region:** x≈208…1524, y≈370…718; x≈208…519 **LEFT month calendar** (not weekly); x≈534…1524 **RIGHT dense board**. Both white rounded panels with thin blue border.
   - LEFT calendar: Persian (Jalali) month header centered, previous/next arrow buttons, seven-column Saturday→Friday grid; highlighted selected/today day; green task indicator if a day has a recorded item. Under horizontal divider: **برنامه امروز** or the selected date, actual dated plan rows, and **افزودن برنامه** button for authorized management (do not broaden backend create permissions).
   - RIGHT board header: **برد وظایف من** with clipboard icon at right, a search field at left, and real dropdowns **همه پروژه‌ها / همه واحدها**, plus manager-only scope; no placeholder menu options without real records.
   - Right→left Kanban four columns: **برای انجام** (blue), **در حال انجام** (sky), **منتظر دیگران** (amber), **تکمیلی** / underlying completed status **تکمیل‌شده** (mint green). Show up to 3 small real items per column, progress bar only when real progress is stored; not random. Clicking a task opens its original editor with evidence/files/history. Column heading and "مشاهده همه" actually filter the expanded list. Under board, include a compact linked recent-task list (up to 50 real permitted records, initial); no giant gaps.
7. **Bottom full-width correspondence table:** x≈534? screenshot table actually begins after calendar at x≈534 and ends x≈1524, y≈734…965. In code the strip sits full content width below the board, which is a deliberate responsive improvement; agent should align its x and width to reference as closely as possible. Header **تیکت‌ها و مکاتبات اخیر**, envelope icon on the right, four pill filters toward the left **همه / تیکت‌های دریافتی / تیکت‌های ارسالی / مکاتبات بین واحدها**, counts calculated from real data. Eight table columns from RTL: **کد | عنوان | منبع | واحد مرتبط | مسئول | وضعیت | تاریخ | …**. Table rows from permission-scoped `/api/internal-tickets` and existing linked staff-work ticket rows; original conversations and attachments remain reachable via original routes. Do not fabricate exact counts 105, 43, 28, 19 from screenshot or auto-migrate Gmail. Internal tickets ≠ arbitrary imported email threads.
8. **Role/organizational responsibility** content remains functional under the dashboard as a compact collapsed detail so data is not deleted. Existing /staff old views and routes remain accessible.

## Data and behavior
- `readStaffData` returns authorized `staff_records`. `isWork` and `participant` determine tasks. No new tables. This is role-safe `mine` view by default, and authorized manager can select wider scope.
- KPI state definitions: all=real permitted, new=`todo`, today=`executionDay===today`, waiting=`blocked/review/changes`, overdue=`isOverdue`, unassigned=uncompleted records without owner (manager only). Never treat pending communication reply as the same as task status automatically.
- Initial list max 50 recent actual records. Never randomly assign former tickets, calls, Gmail or contact records. Existing auto-projection to staff work only runs under its current authorized routes; test actual assignee account visible in staff planner after authorized assignment, and source pointer is stable and idempotent.
- Mobile: under 740px calendar stacks above board, two primary cards/row, two or three KPI cards/row, two Kanban columns and horizontally scrollable table.
- Month and day are derived dynamically with `calendarDays(anchor,'month')`, Persian calendar Intl. DO NOT hardcode screenshot month/date.
- Responsive geometry reference has now been scoped to route `/staff?view=dashboard`: topbar width full, 68px; sidebar fixed LEFT width 185px below header. Make sure nav is still keyboard accessible and mobile overlay closes on Escape; do not interfere with other workspace pages.

## Files changed in this branch
`components/workspace/work-command-dashboard.tsx`
`components/workspace/work-command-dashboard.css`
`components/workspace/work-correspondence-strip.tsx`
`components/workspace/work-correspondence-strip.css`
`components/workspace/workspace-shell.tsx`
`components/workspace/workspace-repair.css`
`public/brand/synapse-neural-header.svg`
`tests/unified-work-dashboard.test.mjs`
and this handoff document.

## QA and precise acceptance gates
1. Diff this branch against the actual deployed site and other ongoing unmerged ticket/finance/intake branches; prefer scoped cherry-pick, not full cross-branch merge.
2. Run `node --test tests/unified-work-dashboard.test.mjs` + other work/navigation/account/communication tests; TypeScript compile, production Build, logged-in HTTP. Source commit is NOT proof of runtime success.
3. Capture screenshot **1536×1024** of authorized manager dashboard beside the owner's image. Compare x/y positions, left sidebar, 68px dark header, primary card sequence, 6 KPIs, calendar, board cards, table, font metrics, colors, whitespace. Retest desktop 1280px and narrow mobile 390px. Fix visual divergence without redoing approved work.
4. Verify Jalali date grid weekday offset, navigation across Esfand→Farvardin, months with 29/30/31 days, daylight and timezone; click day and verify actual plans.
5. Verify counts with DB against permissions. Show a true zero when no entries. The illustration numbers are not real. Test manager-only unassigned, per-assignee visibility, public vs internal docs, and RBAC. Use test records only in staging for mutation tests.
6. Verify all 4 modules and 6 KPI clicks; search and unit/project filters; modal, task attachments and discussion; approval decisions and history; internal correspondence filters and source link; original back navigation; mobile menu.
7. **Important:** if the integrated ticket link is not visible in receiver staff workdesk, fix the actual existing dispatch projection and tests, not just front-end labels.
8. Stop after focused commit(s), detailed test evidence, and screenshots for manager approval. No main merge, publishing, Hostinger deployment, production data writing or historical bulk assignment without separate consent. Minimum Work credits.

## Known limitations
Visual source screenshot is not in this GitHub branch; owner must attach it to agent. The SVG neuron artwork is an original approximation of the image's glowing scientific pattern. Exact typographic rendering and runtime layout require browser screenshot verification. Neither TypeScript nor full Build nor authenticated database access was available in the current GitHub-only implementation stage. The connected GitHub code is a complete designed source change, **not proof of production-ready functionality**.
