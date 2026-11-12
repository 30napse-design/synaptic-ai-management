# SYNAPSE working rules

Read and preserve `docs/SYNAPSE-RULES.md` when changing authorization or assistant workflows. The owner has withdrawn authorization for assistant-imposed usage quotas or automatic pauses based on usage. Do not introduce such limits without a new explicit owner instruction. Provider limits remain outside the application.

## SYNAPSE source authority and handoff

Before development, fetch the shared Sites Git source and read the latest Sites
version/deployment provenance. Use the latest owner-approved/official Work commit;
record both its full SHA and the live deployment SHA. A ZIP is a delivery artifact,
never authority for selecting the base. If approval is not explicit, label it unknown
rather than inventing approval. Preserve newer Work commits and local unpublished
branches. Create a feature branch from the selected shared commit; do not reset,
force-push, overwrite Work changes, update main, deploy, or change live data without
an explicit instruction that authorizes that action.

Read `docs/source-control/README.md` for version selection and packaging. Every
handoff includes a complete source ZIP, a binary-capable patch with an exact base,
a self-contained Git bundle, full commit IDs, provenance, SHA-256 checksums, and
restore/apply instructions. Use `scripts/release/package.py`; verify restoration.
Archive only to the verified AI Manager account and the known private source
archive folder; preserve existing archives and sharing. Update
`docs/deployment/independent-hosting.md` when code changes affect runtime, storage,
identity, integrations, secrets, migrations, or deployment. Never package runtime
credentials or describe a source archive as a backup of the live database/files.
