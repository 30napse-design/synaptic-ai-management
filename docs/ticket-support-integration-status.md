# SYNAPSE — Ticket integration review, 2026-11-23

This is a **review-only** integration branch based on the current Hostinger deployment branch `hostinger-nextjs-fix`. No data migration, merge or publication has been performed.

## Implemented in this branch
- Approved taxonomy and the exact category and topic wording from `lib/ticket-support-taxonomy.ts`; in particular `پیگیری ارسال فاکتور`, `ارسال فاکتور` and `پیگیری پیش‌فاکتور`.
- Two entry modes inside the existing `/operations?view=tickets` interface: staff recording a website-origin ticket, and an internal/direct entry.
- Ticket title required for direct mode; description optional; name and a phone/email contact required.
- Authenticated, origin-protected server API using the **existing dispatch engine and `ops_items`**, unique client request key and source metadata version 1, existing routing/assignments and audit events.
- Optional secure multiple-file upload endpoint with size and magic-byte checks, private object identifiers, authorization and pending-review quarantine. Hostinger fallback requires `SYNAPSE_PRIVATE_UPLOAD_DIR` set to an absolute private directory **outside** site document root and deployment checkout; otherwise uploads correctly fail closed. Existing R2 BUCKET can be used where configured.
- Existing Gmail and other inbound messages remain in the same ticket view by default. Filter by new source/category/topic only when explicitly selected.
- Private attachments are never publicly served, and unreviewed files are accessible only to authorized management for controlled inspection. No automated malware scanner or approval flow was added.
- Requested invoice topics never send invoices by themselves.

## Deliberate non-goals / deployment gates
1. The **actual external website/WordPress forms are not automatically integrated** into this branch. The “تیکت‌های سایت” mode is staff-entry on behalf of website requests. Public ingestion requires separately approved identity verification, anti-bot and rate limiting, then public-side integration.
2. The live Hostinger runtime sets `BUCKET: undefined`. Set `SYNAPSE_PRIVATE_UPLOAD_DIR` to a private persistent directory and verify server write permissions in a non-production test environment before approving upload behavior.
3. Virus/malware scanning and a reviewed-release workflow are not configured. Uploaded files remain in security-review quarantine; no automatic unrestricted sharing.
4. Database integration, permission and upload tests with separate real staff accounts in an isolated database are still required before production merge.
5. No parallel CRM/ticket database, migration or bulk relabeling of historic records.

## Review protocol
- Inspect GitHub Actions: topic and permission unit tests, TypeScript and production Next.js build.
- Open the PR preview read-only; do not upload files against a production-shared database.
- Configure private storage and isolated test auth/database before executing file and workflow end-to-end tests.
- Owner explicitly authorizes any merge to `hostinger-nextjs-fix`, deployment or website form connection.
