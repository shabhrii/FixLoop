# Queue, retries and idempotency

## Job types
- `ai.suggest-case-fields`: title/category/summary/investigation question draft.
- `ai.suggest-investigation-prompts`: evidence-seeking questions, not cause confirmation.
- `report.render-pdf`: render one approved case snapshot/version.
- Later only if demanded: due-date reminders and scheduled analytics.

## Job payload
Use `jobId`, `tenantId`, target record ID, requesting actor, request idempotency key, creation timestamp and schema version. Do not embed secrets, session tokens or binary files. Worker reloads canonical record via tenant-qualified IDs.

## Delivery and retry
Assume at-least-once delivery. AI retries must not overwrite a human decision; report retries should reuse a valid artifact for the same idempotency key/case version unless regeneration is explicit. Use bounded exponential backoff with jitter for transient errors, no endless retries for schema/permission errors, and a visible failed/dead-letter state. Keep provider error details sanitized.

## Transactional consistency
DB transaction + queue enqueue are not atomic when done as separate calls. Preferred: write an OutboxEvent within the domain transaction, then dispatch to `pg-boss` idempotently and mark delivered. A simpler post-commit enqueue is only acceptable with an explicit durable retry/reconciliation path; don't claim exactly-once.
