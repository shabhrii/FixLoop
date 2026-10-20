# Deployment and release checklist

## Environments
- Local: synthetic records, mock AI, disposable DB.
- Staging: separate resources/secrets/storage, demo tenant and RLS enabled.
- Pilot/production: real customer workspace only after security/recovery gates pass.

## Deploy
1. CI runs lint, typecheck, unit/integration/security tests, schema validation and build.
2. Build from pinned lockfile; follow team dependency/security scanning policy.
3. Back up DB, apply reviewed forward migration, verify RLS state and grants.
4. Deploy app and compatible worker. Use expand/migrate/contract for rolling schema changes.
5. Smoke test login, membership, create case, private upload/download, cross-tenant denial, failed verification closure denial, effective close and PDF.
6. Verify error/latency/job metrics and backup success.
7. Stage rollout to demo/one pilot workspace; keep AI switch-off and rollback process available.

## Rollback
Prefer rolling back compatible application code while retaining backward-compatible schema changes. Do not reverse destructive migrations without a tested restore plan. Stop a suspect worker if data corruption is possible and preserve failed jobs for controlled replay.

## Before real pilot data
- Tenant isolation under production-equivalent role/RLS, session expiry and deactivation tests pass.
- Storage is private; signed URLs expire; evidence finalize validation passes.
- AI provider is disclosed/configurable; no customer data is sent in mock/local path.
- Closure guards/audit atomicity tested.
- DB + object storage backup/restore rehearsal completed.
- Logs/error monitor redacted; incident contact named.
- Retention/export/deletion expectations documented with customer.
