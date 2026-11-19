# FIN-08 — accounting and tariffs

## Existing page and canonical sources

`/finance/ledger` now hosts five internal tabs (`invoices`, `tariffs`, `journal`, `official`, `documents`). Desktop tabs and the compact mobile selector use the same API, `/api/finance?view=accounting`. Mutations use `accounting_*` actions in the existing `/api/finance` route. This is not a new ledger, customer database, invoice issuer, ticket store or banking importer.

Base is published v60 `d576b826de653b73fa43ca676e30c1bbf5b2a382`. The development branch is `feature/finance-accounting-2026-11-19`. Later reviewed upstream integration `ee27fea` and actual v61 source `3dcc254d0f92c928a0fc511ef3cd2a61e7f11c21` are retained. The v61 source tree was verified against that upstream (the only extra upstream file was `cellular-services-reviewed.json`) before recording its otherwise-equivalent source provenance as a merge parent. Animal/pathology display rules and the HP-069/HP-070 billing protections remain in the existing tariff selector. Reviewed cellular source data is preserved; its existence alone is not a new scientific metadata or pricing approval.

No schema migration is required. The implementation extends existing `finance_documents`, `finance_versions`, `finance_journal`, `finance_tax_records`, `finance_events`, `finance_settings` and `finance_files`. Existing financial and laboratory IDs/history are retained. There is no new real account, password reset, bulk assignment, historical data import, bank connection, paid AI call or taxpayer-service submission.

## Five functional areas

1. **Invoices/receivables.** Valid invoices and their version history retain verified-only receipts and canonical balances. A verified advance can be allocated partially across several invoices of the same explicitly bound `research_people` customer and legal company. Source receipt ID/amount/bank row remain unchanged; `invoice-allocation` events and balanced reclassification journal entries carry allocations. A reversal is an audited event and inverse entry. Source transaction and invoice revisions serialize competing operations. Installment projections, payment locks, mother-case permits, refunds and financial summaries use the same allocation-aware verified balance. No reported slip/proposed match becomes verified money.
2. **Tariffs/rules.** `accounting-tariffs` extends the existing tariff bank with immutable versions, proposer, independent scientific and financial review, approval, date validity, currency, unit, source and restrictions. A pending/expired/disabled version cannot silently override an approved current rate. FIN-03 explicitly selects the legal company and loads its approved dated extension; historical invoice lines/versions remain unchanged. HP-070 is a referral, not a new billable tariff. Legal references in `accounting-rules` require an authority, URL, date, scope and responsible person and remain `reference_only`; no legal truth is invented.
3. **Accounting/tax.** Draft and approved entries remain in the same `finance_journal`. Review metadata in existing settings prevents drafts entering the normal posted-ledger projection. Exact balance, stable source identity, independent approval, documented classification and transfer-result evidence are required. Corrections create an exact inverse draft, not deletion/edit of posted lines. Existing generated journal entries can be explicitly assigned to a company without changing their amounts. Tax/insurance/notice deadlines use existing `finance_tax_records`, require a source/responsible person, and feed the existing reminder projection. Excel/CSV journal exports include actual account/debit/credit lines. Marking a destination receipt is manual evidence, not an automatic accounting-software integration.
4. **Official invoices.** Records in existing `finance_tax_records` reference the exact issued invoice version and optional existing shared ticket. Request, reception review, missing data, finance review, independent approval, ready-to-issue/send, documented sent, waiting, accepted/error, correction/cancellation have distinct transitions and audit events. Changing the invoice version blocks stale progression. A final tax ID is entered only with an independently attested external response/reference and evidence; IDs are never generated. The UI and record identify manual documented response recording; no network submission/portal authentication is enabled. Safe status/official-number references project back to the existing mother-case financial summary. Admission continues using the shared official-invoice ticket kind; FIN-08 reads that queue and preserves the ticket ID.
5. **Contracts/documents/reports.** Contracts and appendices use existing financial document/version rows, with party/company/type/currency/dates/responsible person/project or cost center. Review, independent approval, legally reviewed signature, active and ended are distinct. A signature image alone is insufficient; signed versions cannot be rewritten through the legacy editor. Original attachments remain private and append-only; upload records capture the document version, and reusing identical bytes links the old file to the new version rather than overwriting it. Scoped XLSX/CSV/PDF reports read the original receivables, payables, bank, journals, contracts, official records, deadlines and accepted cost references. Funding, assets, loans, deposits and transfers are not automatically classified as expense; linked FIN-05 purchase/petty settlement is not double-counted.

## Company access and initialization

The Owner configures legal companies through the existing FIN-06 bank settings; FIN-08 never guesses a legal entity. `accounting-policy` stores explicit per-company member grants (`view`, `write`, `approve`, `files`, `export`); base financial permission remains necessary, and approval additionally requires `finance_approve`. Technical administration alone does not grant approval. No existing staff account permissions were changed by development or publication.

Owner-only document binding references the original invoice/contract ID and optional existing researcher ID. Company identity is not silently rewritten. Existing payables and funds can be explicitly classified for reports without creating another financial event. Unclassified historical records are flagged; ordinary FIN-08 users do not receive unknown-company data. Existing non-FIN08 permissions remain authoritative for legacy modules; this extension does not silently revoke all prior staff grants.

Server checks protect the new read model, search/counters/history, mutations, exports and evidence. Tagged documents/versions/tax/journal references are also protected in legacy financial reads, mutation routes, print routes and private file delivery. Tagged payables use the existing request/file authorization plus the company restriction. Metadata/audit snapshots of other companies are not returned to a non-Owner. Public customer/self-service authentication is not created by these staff roles; an unauthenticated or unrelated account cannot obtain the ledger.

**First operational setup by the authorized Owner:** select/verify existing legal companies, explicitly bind legacy sources and stable customers, then approve only the required company grants. Missing mapping is not repaired with guessed bulk assignments. New staff privileges, legal identity, bank credentials and tax-service authorization are not activated automatically.

## Validation evidence

- FIN-08: five focused groups, **96 isolated HTTP checks**, including multi-invoice allocation/reversal without a second receipt; same-customer/company protection; historical price preservation; dated tariff approval; draft/posted balanced journals; correction; official transition/response gates; contract signature/appendix rules; private files, direct print, exports, unauthorized staff and five-tab SSR.
- Six unit tests cover allocation conservation, reported/void source exclusion, reversals, source identity, refunds and unsafe-precision rejection.
- Required existing regressions passed: FIN-04 **157**, FIN-05 **304**, FIN-06 **305**, FIN-07 **310**, finance core **113**, dashboard **60**, Final31 laboratory lifecycle **153** isolated HTTP checks.
- After the later catalog merge, FIN-08, core finance, dashboard, laboratory lifecycle and the one-request six-bank catalog reference check were run against the merged compiled source; unaffected already-passing financial suites were not repeated merely to increase counts.
- TypeScript and production Build passed. All runtime suites apply the existing migrations only to disposable D1/R2 fixtures. No new migration or production data-conversion script is introduced.
- No interactive browser/mobile acceptance or real staff/bank/taxpayer login was performed. SSR is not browser interaction. Existing SSR chart container warnings are not a claim of measured mobile chart layout.

Reproduction (from the repository with dependencies installed):

```sh
node --test tests/invoice-allocations.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/test-finance-runtime.mjs finance-accounting-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs finance-payments-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-bank-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-petty-workflow-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-laboratory-center.mjs laboratory-final31-runtime.mjs
node scripts/test-laboratory-center.mjs laboratory-service-reference-runtime.mjs
```

## External/operational limits

Taxpayer submission, bank connectivity, legal computation and transfer to accounting software remain disabled or manually documented until independently authorized valid services and regulations exist. Only IRR/IRT monetary conversion is supported by the current invoice engine; no foreign-exchange rate is invented. Source completeness/legal identity, actual signatures and response authenticity require the authorized human review recorded by the workflow. Historical records without legal-company mapping require explicit Owner review. Actual researcher portal identity, production staff-session write/reload acceptance and full production D1/R2 recovery are not proved by this source or the isolated tests.

The original attachment requested development-only delivery; the Owner later explicitly authorized continuing through publication. Publication must reuse the original Site and audience, preserve newer source, and record the exact native returned version/deployment. A source archive is not a recoverable operational-data backup; none is asserted here.

## Recorded production publication — v62

On 2026-11-19, following the Owner's later explicit instruction to continue through publication, application source `35c39cd1e3bae345baaf08e4bcb71c8056635c4c` was pushed to the original Site source repository and saved as **version 62**. Native deployment `appgdep_6afef9044cec8191874cb50222022664` returned terminal **succeeded**, URL `https://synapse.ekramiihamid.chatgpt.site`, at `2026-11-19T13:26:40.806744+00:00` (17:26 Dubai).

Saved version ID: `appgprj_6af06be01a5481918c6578c73c9b888a~appgver_a82e29d2812c81919ed29f142f0154fa`. Official artifact: `sha256:74849a4f2bbca0dadb3d4912f699ddbaac12a1adcae47cad02280e3c969e06ff`, 11,837,440 bytes, 342 files. Existing audience, Site ID, DB/BUCKET bindings and runtime-secret configuration were preserved (environment revision 18). No new schema migration was introduced and no manual production SQL, real financial mutation, account edit or external submission was performed.

Read-only post-release checks: `/login` responded 200; each FIN-08 tab redirected an unauthenticated request to `/login`; `/api/finance?view=accounting` responded 403 without a session. Initial requests using the default HTTP client received 403; repeating with the normal release-check User-Agent returned the expected login responses. No claim of authenticated staff-write acceptance follows from these checks. Recent native log inspection showed canceled browser requests, not an observed application exception establishing a FIN-08 crash.

The release receipt is a documentation-only follow-up on the development branch. The application source served by v62 remains the exact SHA above. Operational D1/R2 backup or full restore was not performed or asserted; the earlier source-preservation and external-service limitations remain explicit.
