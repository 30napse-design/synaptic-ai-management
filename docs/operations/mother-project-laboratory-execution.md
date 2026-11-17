# Mother project to specialist laboratory work orders — execution specification

Date: 2026-11-17 (Asia/Tehran). Owner-approved requirements; implementation belongs to Codex.
Documentation base: feature/package5-completion-2026-11-16 at cf84df51b416d2e939538588714663ace42a8a5e. This is an observed Git branch head, not a verified deployed SHA.
Work made no application-code, data, account, assignment, migration, merge or deployment changes.

## 1. Evidence and readiness

The live browser reached /login and displayed organizational login and management sign-in. No authenticated form or laboratory navigation was inspected; UI readiness is unverified, not absent by inference.

Read-only D1 overview and bounded table reads, all complete except the explicitly sampled staff_records page, observed:
- research_people, research_orders, workflow_order_links: 0 rows each.
- finance_documents, finance_links, finance_transactions, finance_settings: 0 rows each.
- finance_files: 2 statement files (PDF and Excel), without target links. These are not demonstrated invoice/receipt attachments.
- First 5 staff_records: one legacy invoice record among task records; no reference, source or evidence link on that sampled invoice. More rows exist and one value was truncated. This sample cannot establish counts or absence of legacy projects/invoices.

Reuse the prior read-only laboratory review rather than repeat its scans:
[review at 6ec5ed1](https://github.com/30napse-design/synapse-ai-management/blob/6ec5ed105f00538e19c7cf4d2802535f4dd0b036/docs/operations/unified-laboratory-model-review.md).
It observed 6 directory entries (5 active internal units and 1 inactive synthetic external executor), 9 linked work orders (8 imported preassignments and 1 synthetic), 8 work versions, no laboratory-member mappings/files; all work paused and awaiting acceptance. Those are prior-session observations, not newly reverified counts.

Existing handoffs document reusable capabilities, not proof of current live use:
- [Financial lifecycle](../package3-financial-lifecycle.md): approved service selection, multi-line quotations, versioned tariffs, invoice amendments/delivery evidence, transactions and financial links.
- [Laboratory handoff](../laboratory-handoff.md): issued invoice line to scoped work order, work versions, acceptance, samples, private files, discussion and executor-specific access.
- [Sample/result lifecycle](../package4-laboratory-workflow.md): sample chain, progress, results, QC, independent scientific approval and documented customer delivery.

The financial handoff references existing CSV tariff sources. No standalone .csv path was found in the recursive tree of the documentation base, and live finance_settings is empty. This does NOT prove that the catalog is absent: it may use another format or existing external source. Codex must resolve and expose the existing authoritative catalog and its approval/version metadata, without creating new tariffs or assuming prices.

## 2. Reuse and relationship contract

| Existing object | Required relationship |
| --- | --- |
| Existing researcher/customer identity | Resolve exact existing ID; ambiguous identity requires review, not automatic duplicate creation |
| Existing project/central research order | One canonical mother-project identity; link legacy project via existing workflow links rather than recreating it |
| Versioned financial document | Link once to mother project; retain customer, invoice number/version, lines and evidence |
| Payment declaration/receipt | Several declarations per invoice allowed; evidence is not bank verification |
| Laboratory work order | Independent stable ID, mother-project link, exact invoice version and source line references |
| Sample/result/history | Existing order-specific records; mother-project roll-up derives through links, not copied files |
| Existing tasks/notifications | Reuse stable relationships and routing; no new cartable/parallel task engine |

Do not identify projects by customer name or invoice number alone. One customer can have independent projects; duplicate-looking invoice numbers need issuer/version/context checks. Financial documents and uploads stay canonical, with role-filtered references. Laboratory users must not receive the full customer invoice, sales prices, payment evidence, private customer data or other executors' prices merely because all orders share a project.

## 3. Required staff interface and project form

Use the existing shell, sidebar, APIs and permissions. Main group: آزمایشگاه‌ها. Items: داشبورد مرکزی; پروژه‌ها و سفارش‌ها; آزمایشگاه حیوانی; آزمایشگاه پاتولوژی; آزمایشگاه سلولی; آزمایشگاه مولکولی; آزمایشگاه پروتئینی; آزمایشگاه بیوشیمی; آزمایشگاه میکروبیولوژی; سایر خدمات آزمایشگاهی; بانک خدمات و تعرفه‌ها.

Specialties are views/filters over existing services and executor capabilities, not separate databases or automatic creation of new laboratory identities. Existing combined molecular/protein units retain their IDs while supporting both views. Internal/external becomes descriptive metadata, with all executors treated contractually. Do not remove the existing directory, qualification or authorized inquiry functions; make them reachable in the unified structure.

Dashboard: + ثبت پروژه جدید, search and authorized real aggregates for projects, pending dispatch, running work, sample receipt and results. Invoice/payment details remain permission-filtered. Empty real data must show an empty state.

Stepwise form:
1. Project: generated stable identifier, title, registration date, request/project type, description, state, follow-up owner.
2. Customer/researcher: existing-ID lookup; name, optional organization, phone, email, special requests. Reuse existing details; record authorized corrections once.
3. Invoice: select existing document or attach PDF/image once; number, date, total, state and canonical document/version link. An upload alone is not a structured issued invoice.
4. Payment: attach receipt with any available amount/date/reference, or manually record amount/date/reference/optional destination account/description. Support multiple declarations and send them to the existing Finance Manager workflow. Require enough evidence to relate a receipt to the order; ambiguous links enter review.
5. Service preview: source line, code, quantity, description, validated service/catalog version, specialty and proposed executor. Highlight missing/ambiguous codes; authorized staff confirms before dispatch.

No authenticated form was validated by Work. Under the no-live-data-change limit and without a signed-in UI, no existing setting was changed or claimed ready for staff.

## 4. Deterministic invoice-to-work-order flow

- For an existing structured invoice, use its stored lines directly. Do not OCR/re-enter, reprice historical lines or ask staff to recreate services.
- Resolve exact service codes against the current authorized catalog while preserving invoice-version values and historical tariff references. A specialty match is not executor selection when several qualified providers exist: use the existing approved assignment rule or require authorized selection.
- For uploaded PDFs/images, reuse any existing extraction adapter. If there is no verified parser/OCR connection, show needs review; do not invent extracted lines or call a paid model without permission.
- Show extraction/match evidence and unknown lines. Never guess the specialty from an ambiguous label. Partially matched invoices must not be reported fully dispatched; unresolved items remain explicit pending work.
- After authorized confirmation, group eligible invoice lines by specialty and selected executor into the existing work packages. Example: 2 pathology + 2 cellular + 1 molecular lines produce 3 scoped orders linked to the same mother project and invoice.
- Persist source invoice/version/line references. Replay and concurrent confirmation must reuse existing work orders/tasks and never duplicate them. A grouped job must preserve every source line and quantity; do not flatten different services into one misleading quantity.
- Amendments use existing document/work-version controls. Detect changed, removed or previously dispatched lines; require authorized reconciliation and renewed acceptance when scope changes. Do not silently recreate or overwrite accepted work/history.
- Latest owner policy overrides older pre-start bank-verification gates: an attributable deposit receipt can start execution routing while Finance reviews the bank in parallel. It is not final accounting receipt. Preserve independent scientific approval and existing final-delivery controls; do not infer that manual declarations without evidence grant the same exception.

## 5. Samples, results and communication

All specialties reuse dashboard, work orders, service/tariff or authorized quote view, samples, data/results, communications and performance views. The tariff/quote view must distinguish customer sales prices from executor cooperation terms.

Each sample links to a child work order and thus mother project; retain sender, receiver, time, count, condition and discrepancy history. Any shared sample across services requires explicit existing transfer/allocation records, not duplicate physical samples.
Results upload requires a specific work order and version; the mother dashboard aggregates authorized references. Laboratory technical completion is separate from institute scientific approval.
Attach incoming email/call/site/support records through existing case/order links after identity/context matching. Mid-cycle inquiries reuse the project; intake can initiate a new project when confirmed. The separate 569-input allocation mission must not wait for this form.

## 6. Ordered Codex work and acceptance

1. Resolve existing catalog source and service-code/specialty/capability mapping; reuse current financial and invoice-to-job paths. Preserve Codex's allocation/receipt work.
2. Complete canonical mother-project/document/input links and the unified staff dashboard/form. Add only essential existing-model extensions; any required migration needs separate owner approval.
3. Add deterministic matching preview, grouped multi-line dispatch, revision/conflict and replay protection.
4. Surface the existing sample/result/quality chain and role-filtered project roll-up; provision no live laboratory accounts or records under this mission.
5. In isolation only, test: existing-customer reuse; five-line/three-order example; replay/concurrent confirmation; unknown code/unreadable file; invoice amendment; receipt routing versus bank confirmation; unauthorized other-lab access; sample/result roll-up. These are proposed targeted acceptance cases, not tests executed by Work.
6. Deliver a reviewable code commit. No merge, migration or publication is authorized by this specification. After owner-approved deployment, demonstrate the form and links before declaring staff readiness.

Work delivery: evidence review and executable handoff only; no live configuration applied. Build and repeated historical tests intentionally omitted for this documentation-only change. No confidential data, actual backup or secret is included; no Google Drive archive was created.
