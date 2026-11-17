# Unified laboratory contractor model: operational review

Date: 2026-11-17 (Asia/Tehran).
Scope: read-only observation of deployed D1 data; no source-code review, writes, assignment, workflow execution, tests, merge or publication.
Owner policy: every laboratory, including an institute-based unit, is a contractual service executor. One directory and one operational flow are intended; this report does not implement the policy.

## Evidence and findings

Official Sites reads covered all rows of six tables: `laboratories` (6), `laboratory_jobs` (9), `laboratory_records` (8), `laboratory_members` (0), `laboratory_files` (0), and `research_orders` (0). All six reads reported no more rows and no omitted/truncated rows, columns or values. The SYNAPSE status tool independently confirmed 5 internal/1 external directory entries, 9 assigned jobs, 8 work-version records and 0 laboratory files. Its initial authentication prompt was accepted and the permitted retry succeeded. No confidential record contents are included here.

| Question | Observed result and limit |
| --- | --- |
| Are existing work orders linked to an executor? | Yes: all 9 jobs have a laboratory ID resolving to one of the 6 directory entries. Eight are imported preassignments to internal units; one is an explicitly synthetic job linked to an inactive synthetic external executor. Assignment is not acceptance or execution. |
| Is the flow shared? | Both types already occupy the same directory and jobs tables; the 8 stored work versions link back to those jobs. All 9 jobs are paused, acceptance pending, and result links empty. There are no laboratory-member mappings, laboratory files, or laboratory record kinds beyond work_version. A full cartable/sample handover/results flow for both types is therefore unverified, not demonstrated by the shared storage. |
| Does internal/external block routing? | No type-related blocker was observed in the stored links: jobs exist for both types. This does not prove runtime equivalence. There is no active external executor example, and no new routing or login test was performed. |
| Does unification require data loss or duplicate tasks? | No such requirement follows from the observations. Keeping laboratory IDs, job IDs and work-version relationships allows a unified directory without recreating records. Actual duplicate-task absence was not tested; task/history tables were not scanned. Recreating or merging laboratory identities could break relationships and must not be inferred from a navigation change. |
| What operational gaps remain? | The 8 imported preassignments have zero quantity, no due date, no acceptance and instructions explicitly awaiting service-detail completion. No central research-order rows exist. Executor memberships and sample/result evidence are absent in the inspected laboratory tables. These gaps prevent claiming operational readiness irrespective of type. |

## Minimal Codex handoff; no implementation by Work

- Present one laboratory/service-executor directory and selector using existing stable IDs. Treat location/type as descriptive metadata; do not physically merge different executors or replace internal IDs.
- Reuse existing jobs, work versions, sample handover and result/quality mechanisms for every executor. Verify and remove only actual type-based execution restrictions; they were not proven by this read-only review. Any new contract terms or pricing fields should reuse existing structures.
- Complete authorized service scope, quantity, dates, executor appointment/access and central-order linkage for preassignments through existing controls. Do not treat these incomplete records as accepted work.
- Keep executor access limited to its assigned work, with customer invoice prices, other executors' offers and confidential notes protected. Unified directory membership does not grant shared data access.
- Reuse existing task/notification links and preserve history; never recreate tasks merely because labels or directory grouping change.
- Preserve the latest owner policy: an order-linked deposit receipt starts the execution-routing flow while banking review proceeds in parallel. It is not final accounting confirmation. Codex owns this implementation; it was not tested here.

## Repository and verification boundary

Documentation-only branch, based on `f64a68e4a6bb8a3c45a54a0a73abc89abd32a67d`, retaining application baseline `66df78f2a1867c6aff3be34f62436284587e66a7`. This is not a statement about Codex's unpublished work or a deployment.
No application files changed, so no Build or repeat operational tests were run. No database backup, data transfer or Google Drive archive was created. Wait for the owner's next instruction.
