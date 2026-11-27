# SYNAPSE handover from Invent (Relevance AI) - 2026-11-27

Repository: 30napse-design/synaptic-ai-management
Development branch: hostinger-nextjs-fix (HEAD 9e805a81a5c78553674afd716770091a7ddf1fa3)
main: untouched. No deployment triggered. No database changes.

## 1. Completed

WK-01 only (integrate PR-59 onto current hostinger-nextjs-fix HEAD and make all PR checks green).
No ERR requirement (ERR-25, ERR-27, ERR-31, ERR-36, ERR-37, ERR-38, ERR-39), D1, D2 or new TKT work was implemented.

## 2. Commits and branches

Branch integrate/wk-01-pr59-on-head-2026-11-26 (merged into hostinger-nextjs-fix via PR #1):
- 6c55937b8ed04403b498e077cefe764d25579cd1  Merge PR-59 (5 commits, head 7d9fd812868209c6931aa6ced95b7c4f08a5360b) onto 09e95a1
- b0711b0a4151923f4247e2bb10d8119841bfe965  tests: ticket source selector now asserted in ResponsibilityArea (TKT five-filter desk)
- 7c9f68115429079c94528b94833dc715aa0ff0c7  tests: bulk panel condition updated; manual-assignment gate in assignable() still asserted
- 114b76eb715f2a2dffdec31184367c40c00da479  Merge hostinger-nextjs-fix d78bce0 (sheet row limit fix; tree unchanged)
- 02f6ac80837f405a82e6c0f697244936d32c2d75  tests: ticket detail attachments/sourceBody/sourceUrl asserted in OperationsConversation (PR #60)

hostinger-nextjs-fix:
- 9e805a81a5c78553674afd716770091a7ddf1fa3  Merge PR #1 (WK-01)

checkpoint/invent-handover-2026-11-27: this file only, on top of 9e805a8.

## 3. Modified files

From PR-59 (unchanged content): lib/accountant-owner-policy.mjs, lib/accountant-owner-policy.ts, lib/input-sources.ts, lib/ops-sync-config.json, tests/accountant-owner-policy.test.mjs
Invent test alignment (no app code changed): tests/ticket-compact-final.test.mjs, tests/operational-intake-reconcile.test.mjs

## 4. Tests

PR #1 on 02f6ac8: 10 of 10 workflows succeeded (each runs node --test, pnpm exec tsc --noEmit, pnpm build).
No known remaining failures on hostinger-nextjs-fix.
Note: old repository 30napse-design/synapse-ai-management cannot run Actions (billing block); old PR #62 is superseded by new-repo PR #1.

## 5. Unfinished

WK-02 to WK-11: ERR-25, ERR-27, ERR-31, ERR-36, ERR-37, ERR-38, ERR-39, D1 and D2 (date/sync fixes), TKT ticket UI items.
The detailed acceptance text for each lives only in the user's original Persian mission document; it is not in this repository. Obtain it from the user before implementing.

## 6. Pending migrations and dependencies

None introduced. No migration created or run. No new packages.
Live verification (Hostinger, production database, Gmail/Sheets sync) was never available to Invent.

## 7. Exact next step

1. Get the mission document from the user and save it to the repo (e.g. docs/mission-wk.md) on a branch.
2. Branch from hostinger-nextjs-fix 9e805a8 as feat/wk-02-<err-id>.
3. Implement WK-02, add/extend tests in tests/, open a PR into hostinger-nextjs-fix, merge only when all workflows pass.

Security note: the new repository is public and contains the owner email and Google Sheet links in code/config. Consider making it private.
