# T03 Financial and Contracts workspace

Financial navigation is consolidated in one group. Legacy financial requests, invoice review, contracts, reseller commissions, tariffs and source ledgers remain reachable; no source messages or manual totals have been converted into verified money.

## Working workflow
1. Enter a quote/contract/invoice with service quantities, repeats, per-unit price, total row cost, discount and configurable tax. Quote/invoice amounts are TOMAN; bank and ledger are explicitly RIAL.
2. Saving an amendment creates an immutable version, resets current approval to draft and retains which old version was accepted. Approval evidence is recorded against the specific version. It does not send a message or obtain a digital signature.
3. Internal approval requires explicit finance approval permission (or owner). Manager-set minimum value and margin require a documented owner exception when breached. Tax defaults to zero until configured.
4. Reduced quantities/repeats create a scientific hold, which survives further edits. A scientific task is created in the real staff board, without prices, and must be completed for the same version. Final T02 release is still a separate workflow.
5. Accepted quote converts to invoice once. Issuance posts a balanced internal receivable/revenue/tax entry. Issued invoices cannot be silently rewritten; cancellation needs a reason and resolved receipts. Printed historical/current customer copies exclude costs and confidential notes.
6. Record receipt, refund, supplier payment or petty-cash expense. Only verified transactions affect balances. Import a bank CSV (ISO dates, bank reference, signed Rial amount, description); account, amount and direction must match. Alternatively record a bank reference, HTTPS proof and verification note. This is recorded manual bank checking, not bank API confirmation. No bank transfers are executed.
7. Allocate an entire verified deposit to an issued invoice for exactly the same client. Allocated receipts are corrected through a documented refund, not direct void. Voids post reversing entries; overpayments and repeated claims are guarded at the database update.
8. Issued invoice rows can create scoped laboratory jobs after the specified minimum receipt. Laboratory receives service/quantity/repeats, not customer identity, invoice values or internal notes. A unique version/line link and atomic job/link creation prevent duplicate jobs.
9. Approved laboratory statement creates one supplier payable; verified full payment updates its own laboratory statement to settled. Reversal reopens it. An integrated statement's state is controlled by financial payments, not manual portal edits. Historic settlement labels are not bank evidence.
10. Tax records hold deadlines, period, official identifier and proof; marking recorded requires an approver, identifier and proof. Internal invoices are not statutory invoices and no tax submission occurs.

## Permissions
`finance_ops` grants the financial office. `finance_approve` additionally permits approval/posting. Existing `billing_ops` only grants financial customer requests and legacy review, not ledger/bank data. New roles are not default grants. Laboratory membership overrides even stored finance grants. Owner configures roles at accounts.

## Pending integrations / limits
- Customer self-service approval/signature, actual bank API, tax-system submission, automated outgoing notifications and full statutory accounting are not implemented.
- Ledger has operational accounts, no accounting-year close or full chart of statutory accounts.
- Supplier withholding/adjustments are recorded in payment terms and net payable description; a separate statutory withholding engine is not implemented.
- Historical Sheets/Drive data are preserved as sources, not automatically imported or treated as bank-confirmed transactions.
- T02 final scientific approval and management KPIs remain for those modules' review.
- All financial input starts empty until real documents are entered; operational messages remain in their existing queue.

## Scientific connection completed
Financial quantity/repeat review tasks can now be opened as a linked T02 scientific case. Approval of its exact protocol version by the named technical reviewer completes that same source task; a subsequent case amendment reopens it. Full study/report cases remain on the staff board until final report approval. No financial prices or margin fields are copied to the scientific/laboratory data projection.
