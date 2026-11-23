# راه‌اندازی سریع صبح کارکنان SYNAPSE — بدون ورود دوباره به Google Sheets

**Branch:** `feature/morning-direct-intake-2026-11-24`
**Based on:** `feature/synapse-nine-category-experience-2026-11-23`
**Scope:** Existing original SYNAPSE workflows, no new parallel CRM or sample store.

## Simple employee journey
1. Open SYNAPSE organizational account. Home page quick links now include **برگه نمونه** (only users already permitted for sample-intake or research supervision) and **کارتابل من**. Existing reception links remain.
2. **Incoming contact:** `/operations` → ثبت ارتباط ورودی → دسته اصلی → **موضوع درخواست dependent on category** → customer/contact/invoice → required caller statement and receptionist response → save. Stored directly in existing ops database; no manual Google Sheet duplicate.
3. **Automatic responsibility routing (existing engine, must verify):** `lib/dispatch-engine.ts:dispatchCreate` calls `classifyCommunication`, resolves `workflow_positions` through `resolveWorkflowOwner`, and generates idempotent `dispatch:<original request id>:<role>` work items via `taskStatements`. Owner determined from *existing active approved position assignment*; unassigned role defaults to management review; no random person, no invented recipient. Validate an actual request of two distinct authorized categories to correct role accounts. The nine intake **category display groups** do not on their own grant authority, choose owners or rewrite old records.
4. **Sample intake:** click **برگه نمونه** → `/sample-intake` → researcher/project → register samples, type, quantity, storage and preferred active labs (optional tick boxes) → save and immediately see the real records on the SAME page. No invoice or mother-case number required. Physical receipt is recorded by reception. Only authorized coordinator can actually send to an active lab. Only its assigned lab account may confirm receipt or report discrepancy. The lab's portal sees only samples assigned to its real laboratory; optional lab tick boxes are only suggestions and DO NOT cause dispatch.
5. **Tasks:** `/staff?view=dashboard` and `/staff?view=all`. Staff see authorized assigned tasks, original request links, history and deadline. Created tasks must be idempotent; verify *on a second staff login* rather than only checking database row existence.
6. **Unassigned historical items:** remain unchanged and visible in authorized management queue. Do not mass reassign yesterday's 1000+ Gmail/calls. Manual review of sensitive/ambiguous records required.

## Smoke test needed before allowing tomorrow's actual live intake
- Login as receptionist; new one-time sample sheet; add 2 distinct samples and check real persisted reload; no Sheets interaction.
- Login as authorized coordinator, physically receive sample then choose lab; login as that lab's account and confirm receipt; verify history and no unauthorized other lab visibility.
- As receptionist, submit two *new* intake requests with unambiguous categories mapping to two different **actual active** roles. Login as each approved role and verify its task appears in the work desk with correct link, title, priority, and no duplicated task after refresh.
- No route should open a blank page; mobile and desktop; read, create, edit/revision guards, search and filtering; no need to rewrite other modules.
- Run existing Node tests, `pnpm exec tsc --noEmit`, `pnpm build`; inspect GitHub workflow status and real staging HTTP.
- **Stop before any production deployment**. Never claim tomorrow's employees can use new code on live SYNAPSE until owner explicitly approves publication and authenticated staging acceptance passes.
- Current ChatGPT-managed scheduled sync of old messages is distinct from Hostinger cron; do not activate OAuth/cron/mail imports as a side effect.
