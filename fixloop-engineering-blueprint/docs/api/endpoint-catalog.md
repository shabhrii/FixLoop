# API endpoint catalog

All endpoints are planned under `/api/v1`, use verified sessions, validate inputs with Zod and return typed DTOs. Tenant APIs require `/tenants/{tenantId}` but still verify active membership and object scope.

## Identity and workspace
- `GET /me` — verified user and memberships visible to that user.
- `GET /tenants/{tenantId}/sites` — list authorized sites.
- `POST /tenants/{tenantId}/sites` — Tenant Admin creates site.
- `GET /tenants/{tenantId}/memberships` — Tenant Admin lists membership records.
- `POST /tenants/{tenantId}/memberships/invitations` — invite flow if delivery provider is configured; may be phase 2.
- `PATCH /tenants/{tenantId}/memberships/{membershipId}` — activate/deactivate/change role; admin check and audit required.

## Cases
- `GET /tenants/{tenantId}/cases` — paginated list with allow-listed status/site/category/severity/date filters.
- `POST /tenants/{tenantId}/cases` — create draft or submit only via an explicit input command; no caller-supplied actor/tenant authority.
- `GET /tenants/{tenantId}/cases/{caseId}` — scoped detail DTO incl. version.
- `PATCH /tenants/{tenantId}/cases/{caseId}` — allow-listed non-lifecycle fields only; If-Match/expectedVersion required.
- `POST .../{caseId}/submit` — validate intake and transition DRAFT to SUBMITTED.
- `POST .../{caseId}/triage` — category/severity, containment assessment and routing decisions.
- `POST .../{caseId}/close` — explicit closure command that runs every closure guard.
- `POST .../{caseId}/reopen` — Quality Engineer + reason.
- `GET .../{caseId}/timeline` — filtered audit timeline.

## Evidence
- `POST .../{caseId}/evidence/upload-intents` — create a pending metadata record and exact-object short-lived upload URL.
- `POST /tenants/{tenantId}/evidence/{evidenceId}/finalize` — verify uploaded object and mark AVAILABLE.
- `GET /tenants/{tenantId}/evidence/{evidenceId}/download` — authorize and issue private signed download URL/redirect.
- Optional `DELETE .../{evidenceId}` — only under archive/retention policy, audited.

## Investigation
- `POST .../{caseId}/findings` and `PATCH .../findings/{findingId}` — create/edit claim and support links.
- `POST .../findings/{findingId}/confirm` — explicit human confirmation, evidence/rationale required.
- `POST .../{caseId}/investigation` — create/read investigation.
- `PUT .../{caseId}/investigation/why-steps` — save ordered steps with version guard.

## Actions and verification
- `GET /tenants/{tenantId}/actions?assignedTo=me` — caller's assigned actions.
- `POST .../{caseId}/actions` — Quality Engineer creates/assigns action.
- `PATCH .../actions/{actionId}` — allowed fields only; assignment/object checks.
- `POST .../actions/{actionId}/complete` — explicit complete command; completion note + proof policy.
- `POST .../{caseId}/effectiveness-checks` — human reviewer submits measurements, criterion, outcome and evidence.

## AI/report/search
- `POST .../{caseId}/ai-suggestions` — rate-limited queued request.
- `GET .../{caseId}/ai-suggestions/{suggestionId}` — scoped result/status.
- `POST .../{suggestionId}/decision` — explicit accept/edit/reject; original output retained.
- `POST .../{caseId}/reports` — request PDF for snapshot/version.
- `GET /tenants/{tenantId}/reports/{reportId}` — report status and authorized download capability.
- `GET /tenants/{tenantId}/closed-cases/search?q=...` — tenant-scoped closed-case search.
- `GET /healthz` — liveness only; no environment values or internal diagnostics.

## API mechanics

Cursor pagination; default page size 25, maximum 100 for case lists; query string length bounded; sort fields allow-listed; timestamps serialized as ISO-8601 UTC. Add an idempotency key to retriable create/close/report commands. Do not leak cross-tenant object existence or row counts.
