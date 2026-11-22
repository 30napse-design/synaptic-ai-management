# SYNAPSE — three-stage scientific consultations | Agent handoff (2026-11-22)

## Scope and diagnosis
Existing `/work/science` has a single `consultation` tab alongside study design, QC and final report approval. The intake/dispatch engine already distinguishes A02 (pre-order science), A03 (quotations/invoices), A07/A08/A13 (execution/lab/result collection) and A09/A10 (delivery/post-results). There is no single explicit, linked, versioned consultation lifecycle across these sources. **Do not build three isolated CRMs.**

## Three stages and names
1. **مشاوره علمی و طراحی پیش از اجرا**: quotations, revised invoices, marker choice, model/assay selection, study design, sample sizes, feasibility, scientific approval. A03 finance decisions must remain in finance subsystem and require finance approval; scientific staff can recommend changes only.
2. **هماهنگی علمی و مستندسازی حین اجرا**: lab↔researcher queries, acquisition, sample/custody, raw data review, QC, analysis, interim document preparation, deviations and re-tests. This is *not* customer advice exclusively; use "هماهنگی و کنترل علمی".
3. **پشتیبانی علمی پس از تحویل نتایج**: explanation of released reports, clarification, additional data, revised reports, re-analysis, additional services; never silently overwrite issued reports.

## Essential rule: ONE parent case; multiple phase episodes
A parent research order/request has 0..n consultation episodes and a chronological evidence/comment stream. Episodes may be reassigned, reopened and moved between phases with an event record. Persist references to the **actual** ops request, project/research order, invoice, science case, lab job, original report/version and sender/recipient. Avoid duplicating customer info. A stage change is not a new project.

## Model seeded now
`lib/consultation-workflow.ts`: stage vocabulary, topic vocabulary, family mapping, guarded statuses and data validation. This is intentionally pure, non-invasive code, not a functional persistence feature.

## Implementation work for agent — in order
1. Verify actual Hostinger build branch HEAD and DB migrations. Implement additive SQLite/D1 **and** PostgreSQL migrations matching repository runtime conventions (inspect `drizzle/` and `runtime/postgres/`). Proposed tables: `consultation_episodes` (id, parent_request_id, order_id, stage, topic, state, assigned_role, assigned_member, invoice_id, science_case_id, lab_job_id, report_id, report_version, question, revision, timestamps); `consultation_events` (id, episode_id, kind, actor, body, evidence JSON, source_key, created_at), unique event source IDs. Require case-level optimistic version checks and audit.
2. Add owner/manager and **role/scoped data visibility** guards consistent with `dispatch-policy.ts`, `science-policy.ts` and `finance-policy.ts`. Do not grant global invoice, laboratory, customer or medical data read rights. Customer communications must not expose confidential internal notes. Preserve separate read and approve roles.
3. Add `/api/consultations` GET/POST with explicit actions: create, assign, comment, attach-reference, change-stage, request-approval, approve, resolve, reopen. Validate linked references exist *and* are readable to actor. Reject invalid transitions, invalid evidence URLs, stale revision, forged operator, duplicate external event. No automatic external messages.
4. Create a three-view workbench, ideally `/work/consultations`, linked from science navigation, **without removing** existing `/work/science` functions. Filters by stage/status/owner/due, queues for unassigned/awaiting lab/approval, timeline, parent-case context, evidence links. Distinct actions by stage:
   - before execution: study brief, marker/assay rationale, requested quote correction, approval required before finance document issuance;
   - during execution: lab question, sample status, raw data/QC, report draft version, open deviation/owner/due;
   - after delivery: immutable delivered report reference, follow-up question, correction/re-analysis as new version, approve response before send.
5. Link `/operations` intake A02/A03/A07/A08/A09/A10/A11/A13 to the workbench. **Suggested** classification requires staff confirmation; never auto-infer a final scientific answer or send externally. Use existing mail/source keys for idempotency, do not import mailbox twice.
6. Backfill in dry-run only; report counts, ambiguous links, duplicates; migrate after owner approval and backup. No alteration of existing issued invoices, released reports, or completed tasks.
7. QA: three complete lifecycle cases, one across all stages; invoice revision gate; lab/contractor query; report amendment versioning; lost-update conflict; unauthorized user denied; source/evidence redaction; duplicate Gmail replay; historical imports; PostgreSQL clean build/HTTP.

## Explicit boundaries
- Do not change `main`, active `hostinger-nextjs-fix`, deployed Hostinger, or old ChatGPT Site until reviewed.
- Keep existing science, finance, lab, staff, mail and operations pages and APIs intact; additive migrations only.
- Minimal AI usage: deterministic routing/status first. No costly automated model calls or unsolicited mail.
- This branch is a preparation branch. No deployment implied.
- Staff can draft and classify, but final scientific or finance approvals remain with authorized signatory.

## Agent completion evidence requested
Provide changed file list, migration SQL for both runtimes, commit SHA, `tsc`/build/tests, authorization test evidence, route screenshots on desktop and mobile, seed/backfill dry-run report, and a yes/no recommendation for staged release. No publication without explicit permission.
