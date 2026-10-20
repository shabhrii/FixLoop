# Domain services

- `case-service.ts`: create/edit/submit/triage/reopen/close using transitions and optimistic concurrency.
- `investigation-service.ts`: findings, fact/hypothesis labels, confirmation rationale and ordered Why steps.
- `action-service.ts`: ownership, due dates, progress and proof-backed completion.
- `verification-service.ts`: reviewer decision and closure gate; ineffective/inconclusive result blocks closure and may return to corrective action.
- `evidence-service.ts`: authorized upload intents, finalize, download and lifecycle.
- `ai-suggestion-service.ts`: enqueue, schema-validate, persist, and record accept/edit/reject decision with provenance.
- `report-service.ts`: stable snapshot and PDF job.
- `search-service.ts`: tenant-scoped closed-case index and bounded search.

Services return domain DTOs and explicit results; route handlers should not repeat their transaction logic.
