# Approved access policy — 2026-11-25

Status: approved requirements; implementation and deployment not yet verified.

## Accountant
Independent login `accountant`; never convert `specialist`. Owner creates, appoints, edits, disables and resets accounts from /accounts. No automatic assignment to a vacant role. Finance-related customer records and tickets only; no unrelated research or personnel records. Read all authorized finance modules. Create new financial records, drafts, receipts, expense requests, petty-cash entries and financial tickets through validated existing workflows. Existing records cannot be modified directly: submit proposed change, reason, record ID and revision to management; apply only after authorized approval, revalidation and audit. No financial final approval, issuance, voiding or deletion. Bank transactions and balances and tariff catalog are strictly read-only; no imports, reconciliation changes or settings changes.

## Owner
Only authenticated owner may manage accounts, permissions, appointments and deletion. Enforce on server, not merely UI. Controlled deletion for test invoices, quotes, intake, tickets, complaints, projects and other supported records; preview dependencies, require confirmation and reason, audit and recover where possible. Preserve issued financial documents, linked payments, journals and statutory records; use documented void/reversal where necessary. No bulk destructive SQL or shared deletion password. No deletion of actual records during development.

## Implementation and acceptance
- Discover existing account administration and all mutation endpoints; add minimal RTL controls to /accounts using existing services, without changing existing users or passwords.
- Separate role-specific server guards from UI visibility. Default deny unclassified accountant writes; explicitly validate create-only actions, including nested payloads and indirect edits. Enforce finance-only ticket scope across reads and writes.
- Implement revision-bound management approval queue, audit and conflict protection. Do not equate broad finance_ops with accountant permissions without exhaustive mutation guards.
- Keep existing routing, assignments and history; route only to an active appointed authorized accountant; otherwise management triage.
- Verify owner and non-owner deletion on every supported API, dependencies and recovery. Never delete real records in tests.
- Test positive and negative access, existing roles, TypeScript, production build, desktop/mobile and test database. Merge only verified implementation into deployment branch. This document alone grants no permissions and is not a deploy-ready feature.
