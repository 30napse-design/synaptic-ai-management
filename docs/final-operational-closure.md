# Work final operational closure — 2026-11-17

## Provenance and scope
- Live baseline confirmed through Sites: version 51, `3bbdb2c1b328e241ded003bc4e7b57f66f76c152`.
- GitHub parent: `ef70e5e05b6bf2b980426eec722915975fb46a14`, the subsequent v51 publication record. It changes documentation only.
- Work branch: `feature/work-final-operational-closure-2026-11-17`.
- This delivery changes code and isolated fixtures only. No production record, employee account, secret, schema migration, source import, live assignment or deployment was performed. GitHub main and concurrent Codex branches remain unchanged.

## Executed fixes
1. Explicit owner-only `owner_accept` in the existing operations API/UI records immutable acceptance. The existing approved, active assignee receives the existing cartable projection; retries do not duplicate tasks or reset human status/date. Missing/inactive assignees remain in the assignment queue, and approved manual assignment clears that queue marker. Acceptance is not bank or scientific approval.
2. A mother project, its exact financial-document ID and child laboratory jobs now participate in the existing typed workflow graph. A manager can attach the mother project to an existing, identity-verified central order. No automatic researcher, order, invoice or parallel CRM is created. Existing order/invoice/delivery selectors keep internal IDs and revisions out of the main forms.
3. Finance can explicitly match an existing invoice with exactly the same normalized invoice number. Conflicting central-order ownership is rejected; revision guards preserve concurrent changes. Existing payment data is not confirmed or rewritten.
4. Child work-order issuance routes a stable source through the existing dispatch engine into the Research Specialist cartable. Retry uses the same communication key and existing task IDs; routing failures are reported as pending rather than success.
5. Delivery financial checks resolve the exact invoice attached through central-order/project links when no direct legacy financial link exists. Multiple possible invoices remain blocked; a receipt upload still never means verified bank funds.
6. Consumption/documented manager-authorized disposition no longer invalidates scientific approval of unchanged received data. New receipt quantities or unresolved discrepancies still change the scientific basis. Disposal requires reason and HTTPS evidence; balances cannot go negative.
7. `mother_close` requires a closed, documented A09 delivery for the same central order, current financial/scientific approval, all child jobs covered by the approved report, all dependent child cartable tasks completed, and all laboratory remnants resolved. Closed mother projects reject edits/files/execution changes until documented managerial reopening. Closing/reopening history is preserved.
8. Fixed an actual browser crash on the Owner cartable: the legacy management position was being added alongside the canonical Institute Director definition and had no duties array. The canonical owner role now appears once. This does not grant or change permissions.
9. Updated the existing isolated preview harness to use the nine approved login names instead of attempting new legacy scientific/admin account names.
10. Added an offline SQL/SQLite restore and object-manifest verifier. It checks integrity, foreign keys, table counts, file hashes, unique keys and DB object references. It does not export production storage or certify completeness against live infrastructure.

## Successful verification
- Production Build and TypeScript passed on the application changes.
- `final-operational-closure-runtime.mjs`: 200 compiled HTTP checks passed against isolated temporary D1/R2. The scenario links one researcher/order/mother invoice to three laboratory jobs and role cartables, performs staged sample/material custody, protocol approval, result/QC/exact-version scientific approval, verified synthetic accounting fixtures, documented synthetic delivery, request/mother closure, denied post-closure edits and controlled reopening. The existing scientific and financial gates are not bypassed.
- `package3-finance-runtime.mjs`: 113 checks passed for approved services, multi-service quotation, approval, issue/amendment/documented synthetic send, advance/staged payments, bank mismatch, exact financial minimum, settlement/refund, ledger and central linkage. Its old fixture was corrected to provide actual synthetic sample custody before expecting execution; application sample gates were not weakened.
- `package4-laboratory-runtime.mjs`: 91 checks passed for receipt discrepancies, privacy, laboratory execution, result files, Specialist/Research routing, QC/QA, independent exact-version approval, gated delivery and sample disposition.
- `portable-backup.test.mjs`: offline restore/checksum/linkage success and corruption/missing-object/count rejection passed using synthetic files only.
- Browser through the official local preview: all nine synthetic role cartables opened; the Owner crash was reproduced and fixed; a mother project and an unattached payment declaration were submitted through real forms, reloaded and reopened with persisted data. Payment remained pending reconciliation. The preview contains no production credentials/data. Browser success is not real employee acceptance or production activation.

## Read-only live observation
One `get_operations_sync_status` call returned 996 operations, 513 Gmail records, 461 incoming calls and 569 unassigned operations (422 calls, 147 Gmail). No historical allocation/import was executed. The API reported zero financial documents/transactions and zero scientific cases. This is an observation at this execution, not proof that live financial or scientific workflows have been accepted by staff. These business data remain untouched.

## Required owner acceptance after Codex integration/publication
1. Securely log into the nine existing accounts; verify permitted views and denied financial/scientific actions. Do not send passwords/cookies in chat.
2. Use clearly marked synthetic records: accept one request as Owner, verify its designated employee cartable/today/notification, save follow-up, logout/login and verify persistence; check the unassigned queue path.
3. Use one identity-verified central customer/order and a uniquely numbered synthetic mother project: link the existing invoice, issue multiple laboratory jobs, record partial receipts/results, complete protocol/QC/independent approval and authorized financial review, document the synthetic delivery and close/reopen the project. Do not confirm real money, send real external messages or dispose real material as a test.

## Unresolved activation / migration boundaries
- No safe application Owner/employee session was supplied for production acceptance. Source-hosting privileges are not an application session; no forged employee identity was used against production. The local fixture login helper is never part of the application production route.
- No connector exposed a full consistent D1 export or complete R2 download with metadata. A full live backup and restoration rehearsal therefore remain unavailable; the offline verifier is not a substitute. Obtain official exports and secure pepper transfer through the hosting provider/authorized Cloudflare account.
- OAuth scopes, four Gmail intake, independent cron and external delivery were not activated or attested by this code task. Existing adapters/configurations are preserved; these need their real provider authorization and a separately observed run. No paid AI/model or bulk historical sync was started.
- Hostinger shared PHP/ordinary Node is not yet a verified destination for `cloudflare:workers`, D1 batch semantics and R2 object bindings. Destination runtime/adapters, TLS, OAuth callbacks, scheduler, private object storage and secure secret delivery must be configured and tested before migration. See the updated existing `docs/independent-runtime-fa.md`.
- Codex must review/integrate this branch and deploy the exact reviewed commit. No release-ready claim overrides the above operational acceptance/backup limitations.

## Codex integration verification and publication candidate

- Integration branch: `integration/work-final-release-2026-11-17`, based on Work `5243da369f2b534bf9aef07b796fe4b28387c0bf`. That commit already contains published v51 `3bbdb2c1b328e241ded003bc4e7b57f66f76c152` and the subsequent documentation commit `ef70e5e05b6bf2b980426eec722915975fb46a14`; no conflicting or newer source changes were found during fetch. Original Work history and all existing financial/laboratory forms remain present.
- Fixed one reproduced review-queue regression: when the approved assignee is reactivated and the original cartable task already exists, explicitly selecting that same assignee now clears `acceptanceNeedsAssignment` rather than returning an unchanged result and leaving the request stuck in the queue. Existing task identity/history remain intact. The new integration assertion failed before the fix and passed afterward; no live record/account was edited.
- Final TypeScript and production Build passed. Isolated compiled HTTP results: full closure 205, finance 113, laboratory 91, eight-account/cartable 128, reception 26 (563 checks in total). Offline portable backup test passed for synthetic SQL/object files, including tampering/missing-object/count rejection. The initial backup test subprocess was denied by the execution sandbox; it passed when run with the execution permissions required for child processes. It never accessed production storage.
- Pre-publication read-only production observation: 996 operations, 513 Gmail, 461 calls, 569 unassigned, 9 laboratory jobs; no financial documents/transactions. Counts are observations, never code constants. No data import, assignment, account/permission change, migration, paid API activation or financial operation is performed for this release.
- Native v51 source and saved application artifact were read back as the rollback baseline. Code rollback is available by redeploying that saved version; a production-data rollback/backup is not attested. Existing public audience and storage bindings must be preserved.
- Authenticated production employee acceptance, real external connections and a complete production D1/R2 restore remain unverified without valid secure access. No secrets, customer exports or production database files are committed. This publication does not activate migrations or authorize real financial approvals or hosting transfer.

### Verified publication

- Published version **52**, source `132aee77ff624fb4ceb12368fc362ae993c730d5`; official GitHub integration branch verified at that SHA before source push and save. GitHub main remains unchanged.
- Saved version `appgprj_6af06be01a5481918c6578c73c9b888a~appgver_07de3eadbe9c8191be17a8cea7e5c396`; native deployment `appgdep_6afcac361a3c8191b6bafb7f458d4c77` **succeeded** at 2026-11-17 19:34:23 UTC / 23:34:23 Asia/Dubai. Live URL: `https://synapse.ekramiihamid.chatgpt.site`.
- Native application artifact hash `sha256:9ee925886e00b42c14db05d4209d60e7cb50f4d319a5e5420f1a6e51929a9d6e`, 7,628,800 bytes, 258 files. Public audience, D1/R2 bindings, MCP and environment revision 16 preserved. No migrations, account edits, operational imports/assignments or financial transactions were executed.
- Post-publication actual read-only counts match the pre-publication observation: 996 operations, 513 Gmail, 461 calls, 569 unassigned, nine laboratory jobs. Matching totals are not proof of complete row-by-row recovery or contents.
- Live HTTP smoke: `/login` 200/password form; `/work/lab` redirects unauthenticated visitors to login; mother API 403 and operations API 401 without an employee session. Protected-route denials do not establish employee login success or a functional defect.
- Actual staff acceptance, external OAuth/cron/model activation and full production-data backup/restore remain pending valid secure owner/provider access. Existing v51 archive is retained for code rollback; no live restore was rehearsed. No redundant Drive archive was generated for this incremental change.

## Unified FIN-01–FIN-07 and laboratory release candidate — 2026-11-19

### Scope and provenance

Owner authorized integration and deployment on the existing SYNAPSE Site **after successful validation and a valid recoverable backup**. This instruction does not waive the backup condition. No new FIN-08 page/module, accounting engine or database was implemented. Existing central ledger functions, legacy routes/navigation and access are preserved as dependencies of the seven financial sections.

Development branch: `integration/finance01-07-laboratory-final-2026-11-19`.

Inputs retained as actual Git ancestors:

- FIN-07: `5a1c5cd6179076308e77053579ebc149635a6d9f` (includes FIN-01 through FIN-06 source).
- Final31 laboratory workflow: `5ecb4d827f19af37e5add9fc6953b663ee1e8c3b`.
- Latest reviewed animal-catalog integration: `075683a5ef6b5349d744c3fb850023473ca246ed` (retains `AN-001` through `AN-203` without approving new prices).
- Laboratory v58: `559e2a899d3dfdc62b30f1e342c84b9af38584c0` remains an ancestor.

Merge `48f1af0` retains FIN-07 financial implementations wherever final31 had only copied the older FIN-06 content, and retains final31's newer laboratory, intake, archive/restore, navigation and staff-workspace behavior. Merge `9c1b1d5` adds the reviewed catalog without losing the newer scientific metadata fields. No existing financial source was replaced by an older copy. No real records were allocated, reimported, removed or rewritten. Header/account/AI work was not rebuilt.

The seven existing routes are `/finance/dashboard`, `/finance/invoices`, `/finance/pricing`, `/finance/receipts`, `/finance/payables`, `/finance/bank`, and `/finance/petty-cash`. Shared documents, customers, mother cases, laboratory orders, journal and private attachments keep their original IDs and engines. FIN-08 is outside this release's development scope; retaining the legacy ledger is not an assertion that the proposed FIN-08 specification was implemented.

### Actual verification on the unified source

- TypeScript and production Build: passed after conflicts were resolved. No dependency change or new package was needed.
- FIN-07: 51 named scenarios / 310 isolated HTTP checks.
- FIN-06: 35 scenarios / 305 isolated HTTP checks.
- FIN-05: 304 isolated HTTP checks.
- FIN-04: 157 isolated HTTP checks.
- Financial dashboard: 60 isolated HTTP checks.
- Finance core: 113 isolated HTTP checks.
- Final31 laboratory lifecycle: 153 isolated HTTP checks.
- Total above: **1,402 isolated HTTP checks**, not production acceptance.
- Combined laboratory policy, petty-calculation, workbook and PDF/bidi tests: **15 passed**.
- Migration 0022, 0023 and 0024 preservation tests: **3 passed**, one each. Runtime harnesses also apply the complete migration sequence to independent temporary D1 databases, with temporary R2 buckets.
- Legacy petty provisioning/import, synthetic login/password change, private receipt, history and correction regressions: passed.
- Older financial fixtures now supply the contact fields required by final31 validation; no production validation was loosened. The catalog assertion checks 620 unique references and every reviewed animal code, rather than the obsolete pre-catalog count of 619.
- No real staff sessions, bank service, production recovery, authenticated live mutation or new browser/mobile acceptance was performed. SSR still reports Recharts container-dimension warnings; API/SSR success is not visual acceptance.

Reproduction uses the existing commands:

```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/test-finance-runtime.mjs finance-petty-workflow-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-bank-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-payments-runtime.mjs --package5-fixtures
node scripts/test-finance-runtime.mjs finance-receipts-runtime.mjs
node scripts/test-finance-runtime.mjs finance-dashboard-runtime.mjs
node scripts/test-finance-runtime.mjs package3-finance-runtime.mjs
node scripts/test-laboratory-center.mjs laboratory-final31-runtime.mjs
node --test tests/laboratory-final31-policy.test.mjs tests/finance-petty-summary.test.mjs tests/finance-bank-bidi.test.mjs tests/bank-workbook.test.mjs
python tests/finance-payments-migration.test.py
python tests/finance-bank-migration.test.py
python tests/finance-petty-workflow-migration.test.py
node scripts/test-petty-runtime.mjs
```

Run each runtime harness on its own temporary database. Test fixtures are synthetic and never bind to production.

### Live state and exact release blocker

The existing Site is `appgprj_6af06be01a5481918c6578c73c9b888a`, URL `https://synapse.ekramiihamid.chatgpt.site`. Audience and credentials were not changed. Official Sites history showed saved v59 at `5ecb4d8` with no deployment ID. The known v58 deployment `appgdep_6afdf0a01570819197cbba15a3e39c97` was read back with status `succeeded`, source `559e2a8`. This is not evidence that the new integrated branch is live.

The native live overview confirmed the `DB` binding and existing table names, without reading private account or financial rows. This is not a complete schema-history inspection or backup. Current Sites tools expose bounded table reads, not a consistent complete D1 export, a full R2 object inventory/content/metadata export or a data-restore operation. No valid production snapshot manifest was supplied; workspace archives are source deliveries, not D1/R2 backups. The offline verifier cannot obtain missing provider access.

**Deployment was not attempted. No production migration, data/account mutation, runtime-secret change, bank connection, scheduler activation or real money operation was performed.** Sites applies pending migrations before Worker upload; therefore an older Worker archive alone cannot establish data rollback safety. In particular the unified code includes 0022–0024, which must not be applied to the live database before backup and a controlled restored-copy check.

Required to proceed: obtain an authorized private D1 SQL/SQLite snapshot and all R2 objects with original keys/metadata, timestamp, checksums and complete manifest from official Cloudflare access or Sites support. Keep it encrypted and outside GitHub; secure secret recovery is separate. Check source completeness with the provider, run `node scripts/verify-portable-backup.mjs /absolute/private/export-directory`, restore to an isolated copy, verify integrity/foreign keys/counts/references and exercise pending migrations there. Then deploy this exact source through the official existing-Site workflow, preserving audience and bindings, and record the returned version/deployment. Complete secure live staff and controlled synthetic-record acceptance afterwards. No password, token or real financial export should be posted in chat.

Remaining final31 product limits (already disclosed upstream) also remain explicit: verified researcher self-service identity, complete scientific metadata, correction of an already-executed individual service, real mobile acceptance and actual customer handover cannot be claimed complete by this integration. No such missing permission or business evidence was fabricated.

### Publication completed — version 60, 2026-11-19

After the blocked-release report above, the Owner instructed focusing on applying the seven financial pages, then explicitly said «منتشر کن». Publication proceeded under that later instruction; no backup or recovery operation that was not performed is claimed. This note supersedes the earlier candidate's deployment status, not its historical test evidence or outstanding operational limits.

- Same existing Site: `https://synapse.ekramiihamid.chatgpt.site`.
- Published application source: `d576b826de653b73fa43ca676e30c1bbf5b2a382`.
- Saved version: **60**, `appgprj_6af06be01a5481918c6578c73c9b888a~appgver_27711afcf30c819197babc352ce569a3`.
- Official saved deployment archive: `sha256:65c0031a318cb0e02956a6ca997a03bf5b23ca2bc35bef755caf237a6c38e5c3`, 11,683,840 bytes / 330 files.
- Deployment: `appgdep_6afeca31be048191b367e7a882104f35`, terminal status **succeeded**, read back at `2026-11-19T10:06:56.366208+00:00` (14:06 Dubai).
- Existing public audience, Site identity, DB/BUCKET bindings and URL retained. No new Site, real-account/password edits, bulk operational assignments, historical import, paid AI or live scheduler activation.
- The standard Sites publication path owns pending schema migration handling; no manual live SQL/data repair was run and no independent production migration-history export was obtained. The three additive migrations had already passed isolated preservation tests.
- No recoverable production D1/R2 backup or restore rehearsal was performed; an application deployment archive is not such a backup. Previously saved versions remain available, but application rollback does not establish reversal of schema or subsequent legitimate business writes.
- Real staff sessions, real-bank authentication and authenticated production create/assign/save/reload acceptance remain unverified. Read-only anonymous route checks do not substitute for those tests.

This documentation-only record is committed separately after publication; it does not change the application source SHA served by version 60 or initiate another deployment.


## WB / EL release integration — 2026-11-19

- Requested source: `ce833d0fa589019fb4182e723813eaa42120e6d4`; actual live base: version 62, `35c39cd1e3bae345baaf08e4bcb71c8056635c4c`. These histories diverge; preserve the live FIN-08 implementation and dated company tariff lookup.
- Integrate the two reviewed protein catalogs and common selectors: WB 76, EL 58. Keep original AN 203 / HP 102 / CEL 102 / GE 79 laboratory IDs and metadata. Do not replace existing GE:MO-* identities with a second GE:GE-* catalog; CEL/GE content changes outside this request are not applied.
- Independent WB/EL subdivision filters and search use the same catalog for laboratory cases and shared financial estimate/quote/invoice entry. Reference-only and conditional EL rates remain unapproved; WB-069 is a referral to WB-014, blocked from separate invoicing. Existing finance documents and historical references are not rewritten.
- Verification: TypeScript and production Build passed. `protein-biochemistry-services-runtime.mjs` passed 15 isolated compiled HTTP requests (counts/identity uniqueness, shared catalog, quote/invoice positive and rejected lines, two services in one linked laboratory order, idempotent approval, no execution permit or bank posting). `laboratory-service-reference-runtime.mjs` passed one isolated GET (620 catalog IDs, preserved EL methods, no fabricated scientific metadata or laboratory prices). Only related checks were run.
- No schema, migration, dependency, API credential, account, live financial or customer-data changes are part of this integration. Isolated test writes use temporary Miniflare D1/R2 only.
- Production deployment and authenticated UI verification are recorded separately after the actual result; a successful local test is not a live write test. Prior native version 62 is the application rollback point; no database rollback is claimed.

## Final catalog integration, FIN-08 preserved — 2026-11-19

Owner-requested sources: laboratory integration `8151314548a087fa44bb36b34472d8ae508731d3` and `integration/wb-el-current-site-2026-11-19` at `cd30520e41dcf97e49c6c114152691530398f370` (published v63). Both are retained as real ancestors of `integration/final-catalog-fin08-2026-11-19`, alongside the full FIN-08 source `35c39cd1e3bae345baaf08e4bcb71c8056635c4c` and its publication record. No FIN-08 backend, company permission policy, invoice allocation, contract or accounting record engine was replaced. No schema migration, operational backfill, historical import, financial write, staff grant or secret change is introduced.

Active shared catalog counts verified through both the laboratory API and quote/invoice picker: AN 203, HP 102, CEL 102, GE 79, WB 76, EL 58, MIC 42 = **662 unique IDs**. LAB07 is an additional **30-reference view** of existing owner codes; no separate service, tariff or invoice row is created for it. The same view is available in the shared order selector. Existing approved AN/HP rates and WB/EL source rules remain intact. Referrals, conditional kit rates and unapproved amounts cannot become automatic charges; FIN-08's explicit per-company approved versions remain supported.

The focused test found duplicated active molecular references: the older source has `GE:MO-*` IDs, while the reviewed file has `GE:GE-*`. The active catalog/picker now shows the specified 79 reviewed GE services. Historical MO source data/approved rates and existing invoice/order payloads remain untouched; legacy reference validation remains available for existing case workflows. No guessed scientific mapping or database renumbering was performed. MIC is inquiry-only in the picker and API: billed quote/invoice creation is refused, mother-case executable dispatch is blocked before writes, and the existing central execution-permission check also refuses recognized MIC services. No future technical/financial approval is fabricated.

Validation: TypeScript and production Build passed after the observed duplicate-reference defect was corrected. `final-laboratory-catalog-runtime.mjs`: **17 isolated HTTP checks**, plus exact counts/ID/reference invariants; `protein-biochemistry-services-runtime.mjs`: **15 isolated HTTP checks**; focused FIN-08 regression: **96 isolated HTTP checks**. All used temporary D1/R2. Previously passing unrelated suites were not rerun. No authenticated production staff write, browser/mobile interaction, real Gmail ingestion or bank operation is claimed.

Production configuration inspected read-only at environment revision 18, without exposing values: `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are absent; `SYNAPSE_INTEGRATION_KEY` is registered as a masked Secret. Consequently the existing missing-Google-Secrets error is correct, not a connector defect that can be fixed with a guessed credential. Google OAuth, ingestion and Cron were not activated; the unchanged input/dedup/organizational routing engines still serve the existing nine roles. Real mailbox receive/replay testing must follow valid credentials and owner consent, before unattended activation.

Required Owner action for Gmail: create/use a Google Cloud Web OAuth client, enable the Gmail API and consent configuration, register the exact redirect `https://synapse.ekramiihamid.chatgpt.site/api/integrations/google/callback`, and place the two Google variables in secure Site settings. Preserve the existing integration encryption key. Then authorize each intended source account independently in `/manage/connections`, select allowed labels, and verify a small permitted receive/replay test before enabling periodic processing. No historical six-month import is performed by this release.

GitHub's branch metadata confirms `main` is **not protected** and the repository is **private**. The branch-protection endpoint returned HTTP 403, `Resource not accessible by integration`; the managed connector does not supply the required administration access. Therefore protection was not changed. This error does not prove the private-repository plan lacks protection support. The Owner must inspect GitHub Settings/Branches or Rulesets with administration access and confirm plan support there. No branch deletion, force push, visibility change or GitHub-main update was performed.
