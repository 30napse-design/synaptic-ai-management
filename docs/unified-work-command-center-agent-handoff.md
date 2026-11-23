# SYNAPSE command center — phase 2 handoff (2026-11-23)

## Ground truth
Base branch `fix/unified-workspace-shell-rtl-2026-11-23`, which already has the shared header / right-hand RTL sidebar Phase 1 and successful CI. This branch `feature/unified-work-command-center-2026-11-23` adds only command-center enhancements.

## Implemented and committed
- `components/workspace/work-command-dashboard.tsx`: the four existing dashboard tiles remain in place. **مکاتبات داخلی** now renders the *original* `InternalTickets` editor, not just a link to another page. This uses the existing `/api/internal-tickets` for Inbox/Sent/Waiting/Forwarded/Archive/Create, with permissions checked via existing `hasAccess(user,'mail')` or management status. The standalone `/work/mail` link remains available as fallback.
- Existing task cards still open the original `WorkApp` modal with original actions, comments, status updates and authorization. The expanded task list now shows every loaded filtered row within the current capped data subset, rather than the first 8. Existing all-unit/all-project filters and manager scope preserved.
- `components/workspace/work-command-dashboard.css`: narrow scoped responsive styling for inline correspondence without altering forms.
- New tests and CI gate; all four sidebar destination links preserved.

## Do NOT do these
- Do NOT remove the four submenu destinations before live acceptance checks show that every original action works in the one-page command center. Current route and flow coverage is not exhaustive.
- Do NOT change the APIs, tables, assignment logic, Gmail/Google Sheets, OAuth, notifications, auth, finance or other modules.
- Do NOT claim production has been published or browser interactions were tested from code-only CI.

## Required release gate for ChatGPT Work agent
1. Compare with actual working Hostinger production branch and preserve newer source / database state. Take a reversible backup.
2. Run node tests, TypeScript, production build and authenticated desktop/mobile acceptance.
3. On `/staff?view=dashboard`, click **مکاتبات داخلی** and test read/create/respond/forward/attach if permitted and existing, then reload and verify persistence. No fake emails or tickets.
4. Click **کارتابل وظایف**, choose distinct real tasks (including a cross-unit project and different statuses), open details and use only authorized safe test operations. Verify direct fallback routes `/staff?view=plans`, `/staff?view=approvals`, `/work/mail`.
5. Check manager and ordinary staff separately for role boundaries; do not leak one employee's tasks or internal correspondence.
6. Ensure sidebar is RIGHT on `/`, `/staff?view=dashboard`, `/staff?view=overview`, `/staff?view=plans`, `/work/mail`; header remains consistent, keyboard/tab, mobile, search, green mail, yellow bell, AI, profile.
7. If all critical checks pass, publish to **existing** `visionofresearch.co` only if user directs publishing; otherwise stop with verified commit and report. Roll back on failure.

## Publication prompt
Use `feature/unified-work-command-center-2026-11-23` and this file. Never treat GitHub CI as a substitute for permission-authenticated browser tests. Preserve any current release changes. The user's priority is an integrated command center with stable functional routing. Never replace the staff work screen with a static visual mockup.
