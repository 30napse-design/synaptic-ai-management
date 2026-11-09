# Laboratory execution: current scope and pending connections

## Operational distinction
T04 is the institute coordinator: profiles, work allocation, dispatch, progress, external inquiry comparison.
T06 is a laboratory account: only its own work orders, samples, results, discussions, external inquiries and statements.
Customer invoice fields, other laboratories' quotes, private notes and institute staff accounts are excluded on the server.
Membership makes an account portal-only even if broad old staff permissions remain stored. General staff and legacy lab APIs are denied to laboratory accounts.

## Initial working workflow
1. Define an internal/external laboratory, areas and capabilities.
2. Owner defines an account or links an existing account; linking restricts that account to its laboratory.
3. Coordinator issues one scoped work package per laboratory/area; same internal source reference can connect separate packages.
4. Laboratory accepts the specific work version; changes to scope/quantity/deadline/assignment require acceptance again.
5. Coordinator records coded samples; laboratory acknowledges count, condition and discrepancies.
6. Progress, raw data and signed laboratory report are recorded for the same order. Files up to 25 MB are private; larger files use HTTPS links.
7. Result records and order versions are preserved. Laboratory technical signature is not final institute scientific approval.
8. Each external laboratory receives only its own inquiry and submits only its own quote. Internal laboratories have no inquiry flow.

## Deliberately deferred to the relevant review stage
- Finance connection completed: issued invoice line → scoped work order; approved statement → payable; verified payments → settled portal statement. Bank CSV / documented manual verification supported. Legacy manual settlement is retained and is not proof of a transfer. No automatic bank execution.
- Scientific/T02 connection completed: linked order results enter the named scientific case, QC feedback returns only to the originating laboratory, and the institute approves an exact report/data/protocol version. Changed data makes previous final approval stale. Client release/sending remains manual. Laboratory technical sign-off remains separate.
- T04 staff board: automatic creation of reminders/tasks from sample delays, inquiries and laboratory messages. Existing work-order dashboard shows pending/overdue orders; no scheduled automation is implied.
- Leadership/T05: final KPI and risk definitions after management review.
- External communications: email/WhatsApp notifications and shipping integrations. Current discussions stay inside the order.
- Directory: supplier qualification evidence/scoring and physical audit criteria; capabilities are self-reported and active status does not certify qualification.

No final customer invoice, private institute note, client identity or other provider quote is copied into the laboratory's work-order projection.

## Reassignment boundary
Records and uploaded files retain their originating laboratory. Reassigning a work order resets acceptance and hides the previous laboratory's samples, quotes, statements, messages and uploads from the new laboratory. The institute retains the complete record. A fresh sample handoff or file must be explicitly recorded for the new laboratory.
