# Accounts/permissions rollout — actual account-source analysis and safe migration plan

Based on user-provided page «حساب‌های سازمانی» extracted on 2026-11-24 and current GitHub code.

## What is implemented in this branch
- The existing account cards are still fetched from /api/auth/accounts; no fake or new accounts.
- Seven existing org-role display titles updated in lib/org-role-catalog.ts, maintaining all role_key, username, member_id, existing permissions, and history. One legacy Research Specialist account remains labelled «کارشناس پژوهش» rather than being impersonated as an accountant.
- lib/approved-account-responsibilities.ts lists exactly nine approved responsibility titles and explicit status of association with old roles.
- app/accounts/accounts-app.tsx now renders nine target responsibilities / compatibility statuses and lists shared staff entry surfaces, while retaining actual existing account cards and access details.
- Existing organizational role configurations already include mail. The current auth-policy effectivePermissions shares operations/calls, and staff task access has per-record visibility. This change does not weaken any of those guards.
- Tests added in tests/approved-account-role-mapping.test.mjs. Tests are NOT reported as run or passing until independently executed.

## Current 9 actual accounts vs 9 NEW responsibilities
current owner -> رئیس پژوهشکده (same).
current executive_director -> label مدیر ارشد پژوهشی; actual scientific oversight/rights NOT yet granted.
current research_manager -> label مسئول فنی پروژه; project-specific technical assignee still needs real mapping.
current scientific_manager -> label مسئول علمی پروژه; project-specific scientific assignee still needs real mapping.
current customer_manager -> label پذیرش و پشتیبانی علمی (safe label).
current finance_manager -> label مدیر مالی و قراردادها (safe label).
NO accounting role/account yet -> کارشناس حسابداری pending.
current administration_manager -> label امور اداری و اجرایی (safe label).
current it_security_manager -> label کارشناس فناوری اطلاعات (safe label).
current research_specialist -> existing legacy account, unmapped to new responsibility; preserve access/history pending explicit management decision.

## Critical questions for actual permission migration / agent
1. Determine whether existing specialist should be deactivated/retired and NEW accountant account created; do NOT silently repurpose it.
2. Confirm which actual member ID is authorized to hold each project-specific technical/scientific role. These are workflow positions, not automatically equivalent to the login role.
3. Confirm exact new senior research oversight read/comment scope: categories A1/A2/A3/B1/B2/B3/B4, not finance, HR, IT.
4. For all actual organizational employees allow navigation to personal homepage, their authorized task board, internal correspondence and intake entry; read list for intake must be limited to own, assigned, shared non-sensitive records based on established ACL. The word 'all' here does NOT authorize reading everyone's private Gmail or financial, HR or password reset data.
5. Ensure case routing resolves one real eligible assignee; if missing, triage rather than default executive/owner and do not create tasks assigned to the wrong user.
6. If creating a new accountant account, setup as a NEW identity with finance accounting permissions MINIMUM needed; financial approvals remain only with manager finance. No copied Research Specialist scientific/lab rights.
7. Never loosen authorization in lib/ops-policy.ts, lib/staff-policy.ts, lib/dispatch-policy.ts, app/api/auth/accounts handlers by title string. Use server-side permissions, assignment, and explicit audit.
8. Prove with authenticated role-browser tests: staff can open intended common navigation, see their own relevant tasks/communications, cannot view unrelated sensitive records; accountant cannot approve finance; scientific/technical roles cannot view accounts/bank secrets; IT cannot enter finances.

## Release controls
No live account mutation, password reset, existing user disablement, DB migration, publication or role-permission assignment was made in this branch.
The definitive role/account migration requires a verified authorized user-to-role roster and browser/DB tests. Preserve the existing production site until confirmed.
