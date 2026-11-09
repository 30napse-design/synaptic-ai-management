# T02 Scientific workspace

The existing `/work/science` page is now a structured scientific workspace; `/work/science?legacy=1` retains its old records and board. The sidebar remains unchanged.

## Six areas completed
1. Consultation: research question, proposal link/private file, objectives, feasibility and reasoning, dated specialist opinions.
2. Study design: model, groups/counts/interventions, sample plan, assays/area/sample counts/repeats/methods/outputs, endpoints and deliverables. Immutable case versions and amendment reason after approved protocol/report.
3. Experts: named responsible scientist, specialist collaborators and technical approver from active internal accounts. Cases/files follow the current named team. `results_ops` is scientific work; explicit `science_approve` is technical approval. Laboratory identity defeats both permissions. Owner has technical authority.
4. Data: linked laboratory raw/results/signed reports for the current work version and laboratory provenance, or manual file/HTTPS data with explicit replacement versions. QC records the exact target signature and case/protocol version, four checks and decision/reason. The interface records human scientific review; it does not run automated image/data validation.
5. QA: nonconformity, corrective action, named owner, deadline, closure evidence/result, accepted/rejected/correction decisions. Only the named technical approver/owner can exclude data from analysis with a reason. Open nonconformities block final approval.
6. Technical reviewer: protocol approval and exact-version report approval are separate. The current report must be registered against the current data/QC/protocol basis. Final approval snapshots report version, protocol version and target IDs/versions/decisions. Subsequent material changes make it stale; history is preserved.

## Connections
- Every new case creates one scientific task on the responsible scientist's existing staff board. Amendments update the same task, not a duplicate. Full cases close with final report approval. Linked-case edits/closure use the scientific workspace to avoid bypassing its checks.
- Existing financial repeat/quantity tasks are reused. For these tasks only, protocol approval completes the source review; protocol amendment reopens it. This does not imply final scientific approval of project results.
- Reception scientific-result entries may create one linked case per source ID. Source messages and attachments remain in reception; only selected scientific context is entered into the case.
- Staff projects can be referenced subject to existing access. Laboratory work orders are attached subject to access, then their current data are available to the case's named team. This does not create or modify execution orders.
- QC note/decision/checks are shown on only the corresponding laboratory's order. Confidential case notes/client names/financial amounts are not returned in that projection. QC notes are explicitly labeled in the scientific UI as visible to the same provider.
- Private case uploads and guarded downloads use R2 (25 MB/file); large files use HTTPS links. Linked laboratory file downloads require both case access and current laboratory/result provenance.

## Operational limits
No email/WhatsApp notifications, client release automation, automated data/image QC, digital-signature provider or new scheduling is implied. Approval is the named user's recorded action, not a cryptographic signature. The owner/technical reviewer must actually inspect the referenced evidence. Existing financial and laboratory input remains real and unseeded.
