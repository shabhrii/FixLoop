# Source-file responsibility matrix

Detailed contract for each significant planned source file. These paths are implementation targets; the working application code is not included in the blueprint.

## Pages and layouts

| File | Responsibility and invariant |
|---|---|
| `src/app/layout.tsx` | Root HTML, metadata, global CSS/providers; no business decisions. |
| `src/app/page.tsx` | Safe landing/redirect using verified session; redirect target allow-listed. |
| `src/app/globals.css` | Design tokens, responsive baseline and focus/accessibility styles. |
| `src/app/(auth)/login/page.tsx` | Sign-in UI, generic errors, accessible form states, secure callback handling. |
| `src/app/(workspace)/app/layout.tsx` | Authenticated shell; server checks session/membership before loading private data. |
| `src/app/(workspace)/app/page.tsx` | Tenant-scoped dashboard; metrics derived from persisted data. |
| `src/app/(workspace)/app/cases/page.tsx` | Filtered/paginated case list; mobile cards and desktop table. |
| `src/app/(workspace)/app/cases/new/page.tsx` | Intake view; client values are input only, never trusted actor/tenant. |
| `src/app/(workspace)/app/cases/[caseId]/page.tsx` | Detail page loaded through a tenant-scoped service; unauthorized IDs concealed. |
| `src/app/(workspace)/app/actions/page.tsx` | Assigned-action queue; assignment enforced by API regardless of filters. |
| `src/app/(workspace)/app/library/page.tsx` | Closed-case search UI; results tenant-scoped. |
| `src/app/(workspace)/app/admin/sites/page.tsx` | Site admin UI; server checks Tenant Admin role. |
| `src/app/(workspace)/app/admin/members/page.tsx` | Membership admin UI; role/active changes checked and audited server-side. |

## HTTP handlers

| File | Responsibility and invariant |
|---|---|
| `src/app/api/v1/me/route.ts` | Verified user + allowed memberships DTO; never expose other users/memberships. |
| `src/app/api/v1/healthz/route.ts` | Minimal liveness only; no DB URL, secrets or detailed diagnostics. |
| `src/app/api/v1/tenants/[tenantId]/sites/route.ts` | List/create sites; write is Tenant Admin only and audit logged. |
| `src/app/api/v1/tenants/[tenantId]/cases/route.ts` | List/create cases; Zod, pagination, rate limits, actor/tenant from server. |
| `.../cases/[caseId]/route.ts` | GET safe detail / PATCH allow-listed non-status fields + If-Match. |
| `.../cases/[caseId]/submit/route.ts` | Dedicated DRAFT→SUBMITTED command with required-field guard. |
| `.../cases/[caseId]/triage/route.ts` | Quality Engineer triage, scope/severity/containment/owner assignment and audit. |
| `.../cases/[caseId]/close/route.ts` | Calls `canClose` and transaction; rejects client-supplied `effective=true`. |
| `.../cases/[caseId]/reopen/route.ts` | Quality role + non-empty reason + version; audited. |
| `.../cases/[caseId]/timeline/route.ts` | Permission-filtered audit events; safe DTO. |
| `.../cases/[caseId]/evidence/upload-intents/route.ts` | Authorized exact-object, expiring upload URL; server creates path. |
| `.../evidence/[evidenceId]/finalize/route.ts` | Check object metadata/size/type and mark AVAILABLE only on successful finalize. |
| `.../evidence/[evidenceId]/download/route.ts` | Re-authorize and issue short-lived private download capability. |
| `.../cases/[caseId]/findings/route.ts` | Create findings and support links; AI cannot confirm. |
| `.../findings/[findingId]/confirm/route.ts` | Explicit human cause-confirmation command + evidence/rationale + audit. |
| `.../cases/[caseId]/investigation/route.ts` | Scoped read/create investigation. |
| `.../investigation/why-steps/route.ts` | Ordered 5-Why step validation and version-safe persistence. |
| `.../cases/[caseId]/actions/route.ts` | Create/list tasks; assignee must be a valid same-tenant user/membership. |
| `.../actions/[actionId]/complete/route.ts` | Completion note, available proof, assignment checks, version + audit. |
| `.../cases/[caseId]/effectiveness-checks/route.ts` | Human review, valid counts/outcome/evidence and guarded transition. |
| `.../cases/[caseId]/ai-suggestions/route.ts` | Rate-limited queued request; no quality authority. |
| `.../ai-suggestions/[suggestionId]/route.ts` | Scoped status/result retrieval; validated result only. |
| `.../ai-suggestions/[suggestionId]/decision/route.ts` | Accept/edit/reject command; preserve original model output. |
| `.../cases/[caseId]/reports/route.ts` | Idempotent PDF request tied to snapshot version. |
| `.../reports/[reportId]/route.ts` | Report status/metadata and authorized signed URL. |
| `.../closed-cases/search/route.ts` | Bounded query, closed-only search, tenant filter and page-size limit. |

## Components

| File | Responsibility and invariant |
|---|---|
| `components/layout/workspace-shell.tsx` | Workspace navigation/context display; no permission authority. |
| `components/layout/mobile-nav.tsx` | Touch-friendly navigation and accessible active state. |
| `components/cases/case-intake-form.tsx` | Intake inputs, client validation, draft/submit states. |
| `components/cases/evidence-uploader.tsx` | Upload intent→bytes→finalize; don't present pending as available proof. |
| `components/cases/case-status-badge.tsx` | Standard status text and accessible non-color-only distinction. |
| `components/cases/finding-editor.tsx` | Statement/type/evidence UI and separate confirm command. |
| `components/cases/five-why-editor.tsx` | Ordered step editor with evidence links and incomplete state. |
| `components/cases/ai-suggestion-panel.tsx` | Unverified proposal + accept/edit/reject. |
| `components/cases/audit-timeline.tsx` | Read-only permission-filtered event history. |
| `components/actions/action-editor.tsx` | Action type, description, owner, due date and required flag. |
| `components/actions/action-card.tsx` | Assignment and status summary, completion note/proof control. |
| `components/verification/effectiveness-form.tsx` | Criterion/sampling/count/evidence and explicit outcome. |
| `components/verification/close-case-dialog.tsx` | Server close command and blocking-reason display; no local status mutation. |
| `components/reports/report-export-button.tsx` | Enqueue/poll/download PDF; handles worker failure. |

## Infrastructure and services

| File | Responsibility and invariant |
|---|---|
| `lib/db/prisma.ts` | Server-only Prisma singleton/pool handling. |
| `lib/auth/session.ts` | Verify session and map auth subject to internal User. |
| `lib/auth/tenant-context.ts` | Resolve active membership and trusted actor context for tenant. |
| `lib/auth/policy.ts` | Central capability and object policy helpers. |
| `lib/validation/env.ts` | Startup env validation; no secret echo in errors. |
| `lib/validation/case.ts` | Intake/patch/filter schemas and quantity invariants. |
| `lib/validation/evidence.ts` | Upload intent/finalize rules; type/size/path schemas. |
| `lib/validation/ai.ts` / `lib/ai/schemas.ts` | Strict output/decision validation aligned with JSON Schema. |
| `lib/errors/domain-error.ts` | Typed domain failures mapped to stable API errors. |
| `lib/storage/private-storage.ts` | Exact object keys, private signed URLs and finalize checks. |
| `lib/ai/adapter.ts` | Provider-neutral typed contract, timeouts and normalized failures. |
| `lib/ai/mock-provider.ts` | Deterministic fixtures for local/tests; never pretend output is from a live provider. |
| `lib/queue/client.ts` | Versioned job types and idempotent enqueue. |
| `lib/audit/write-audit-event.ts` | Append event using caller transaction and sanitized metadata. |
| `lib/reports/render-case-pdf.tsx` | PDF template from approved snapshot only. |
| `server/policies/case-policy.ts` | Pure allowed-transition and closure-guard functions. |
| `server/services/case-service.ts` | Create/edit/submit/triage/close/reopen transactions. |
| `server/services/investigation-service.ts` | Findings, confirmation and 5-Why. |
| `server/services/action-service.ts` | Assignment, progress and proof-aware completion. |
| `server/services/verification-service.ts` | Human outcome, sample validation and guarded transition. |
| `server/services/evidence-service.ts` | Upload/finalize/download/archive authorization and metadata. |
| `server/services/ai-suggestion-service.ts` | Queue, validate, persist and record human suggestion decision. |
| `server/services/report-service.ts` | Snapshot, PDF job, storage, checksum and authorized download. |
| `server/services/search-service.ts` | Tenant-scoped closed-case retrieval. |
| `server/jobs/worker.ts` | Worker bootstrap/job registration. |
| `server/jobs/handle-ai-suggestion.ts` | Scoped reload→provider adapter→schema validation→save suggestion. |
| `server/jobs/handle-report.ts` | Approved snapshot→PDF→private upload→checksum metadata. |
| `server/jobs/dispatch-outbox.ts` | Idempotent delivery of durable events to queue. |

## Contracts, database and tests

| File | Responsibility |
|---|---|
| `contracts/openapi.yaml` | Planned public REST contract. |
| `contracts/ai-suggestion.schema.json` | Strict untrusted AI output schema. |
| `prisma/schema.prisma` | Candidate canonical data model; validate with chosen Prisma release. |
| `prisma/rls.sql` | RLS pattern only; adapt to actual roles/host and test. |
| `prisma/seed.ts` | Synthetic/demo tenant only. |
| `tests/unit/case-policy.test.ts` | Transition + closure-guard cases. |
| `tests/unit/ai-schema.test.ts` | Valid/invalid output and schema drift. |
| `tests/integration/tenant-isolation.test.ts` | Direct API/repository/RLS A-vs-B tests. |
| `tests/integration/closure-transaction.test.ts` | Negative guards and audit atomicity. |
| `tests/integration/evidence-storage.test.ts` | Upload finalization and signed URL policy. |
| `tests/integration/job-idempotency.test.ts` | At-least-once/retry semantics. |
| `tests/e2e/fixloop-happy-path.spec.ts` | Full report→verified fix→PDF workflow. |
| `tests/e2e/tenant-isolation.spec.ts` | Direct cross-tenant UI/API denial. |
| `.github/workflows/ci.yml` | Install from lockfile, lint, typecheck, tests, schema validation/build. |
| `public/manifest.json` | Public PWA metadata; no sensitive caching. |
| `middleware.ts` | Early redirects only; never substitutes for route/service authorization. |
