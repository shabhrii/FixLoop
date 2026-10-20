# Recommended build order

## Phase 0 — secure foundation
Initialize Next.js/TypeScript/package scripts/CI, env validation, Prisma schema+migrations, reviewed RLS/runtime role, typed errors, request IDs, redaction and demo seed. **Gate:** clean migration/tests and demo login/tenant resolution.

## Phase 1 — identity, tenant and intake
Implement session helpers, membership/policy, sites/members, case list/detail/intake, version guard, idempotent submit, private upload/finalize/download and basic audit. **Gate:** mobile case creation with evidence; A/B tenant tests pass.

## Phase 2 — investigation
Implement findings/evidence relation, explicit human confirmation, 5-Why editor/save/version/audit. **Gate:** no system/AI path can confirm cause; all findings traceable.

## Phase 3 — action and verification
Implement action assign/owner queue/proof, effectiveness checks, central state machine, close/reopen. **Gate:** negative closure tests pass for missing action/proof, failed/inconclusive outcome, wrong role and stale version.

## Phase 4 — search and reports
Implement tenant-scoped closed-case search; versioned snapshot, PDF worker, private store, checksum and authorized download. **Gate:** approved values only and cross-tenant report denial.

## Phase 5 — AI assistance
Implement mock provider, adapter, prompt versioning, schema validation, provenance and accept/edit/reject UI; configure real provider only after privacy evaluation. **Gate:** outage is graceful, invalid output rejected, AI has no quality authority.

## Phase 6 — pilot hardening
Run complete E2E, RLS-as-runtime-role, rate/abuse and accessibility tests; rehearse restoration; write provider/privacy/retention/support docs; measure baseline in user sessions. **Gate:** all pre-pilot checklist items have an owner and proof.
