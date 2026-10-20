# Implementation-agent instructions

Read the source-boundary note, PRD, state machine, tenant-isolation rules, AI safety contract, data dictionary and API contract before coding.

## Non-negotiable rules

1. The presentation is ideation. Do not present planned features as built, invent factory customers, pilot evidence, measured savings or production metrics, or treat the FB-204 / VMC-03 / 0-of-150 example as real data.
2. Every authenticated tenant request must verify identity, active membership, capability and object-level scope. Client-supplied `tenantId`, `userId`, `role`, `status`, `verified=true` and ownership fields are never authoritative.
3. Case status mutations go through a central server-side transition service. Generic PATCH must not allow arbitrary status changes.
4. AI output is untrusted suggestion data. Validate JSON Schema and Zod, record provenance and require explicit human accept/edit/reject. AI cannot confirm a cause, approve effectiveness or close/reopen a case.
5. Reports contain persisted, human-approved values from a versioned snapshot. Never represent an unaccepted hypothesis as a confirmed cause.
6. Evidence is private. Authorize before generating signed URLs; generate object keys server-side; validate MIME/header, size, tenant, case association and finalization.
7. Use parameterized queries, strict input validation, typed errors, UTC timestamps, version guards, transactions and audit records.
8. Do not log credentials, tokens, signed URLs, file bytes, raw AI prompts containing customer content or unnecessary personal data.
9. Tests must include cross-tenant denial and failed-effectiveness closure denial, not only happy paths.
10. Follow `docs/implementation/build-order.md`. Keep route handlers thin and put business rules in services/policies.

When a detail is unspecified, choose the conservative option and record the choice in an ADR. Do not silently expand product scope.
