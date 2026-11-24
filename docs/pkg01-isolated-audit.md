# PKG-01 — isolated audit
Base: 4d714f93cc400be969387d0d2d2dbe6723b1a5d5.
Scope: 104 test-directory files; 55 .test.mjs/.test.py candidates, 49 runtime/helper files deferred pending explicit fixture review. A file is not a test-case count.
Run on disposable CI only: SYNAPSE_ISOLATED_AUDIT=1 pnpm test:audit.
No production secrets or credentials are supplied; checkout credentials are not persisted. Child test environments are allowlisted. Tests may use loopback services or synthetic databases; this is not a network sandbox. Do not run against production or import production data.
Report: audit-results/summary.json, summary.md and per-file logs, uploaded even on failure. TypeScript and build run separately. Failed files fail CI; deferred files are not counted as passes.
Runtime scripts, live Hostinger, staff login, external integrations and live Supabase are not validated by this stage. Review each runtime harness and provision synthetic fixtures before enabling.
No merge or deployment without owner approval.
