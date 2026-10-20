# Observability

## Structured logs
Include request ID, operation/route, status/duration, deployment version, safe error code and job/case ID where useful. Tenant/actor IDs belong only in protected logs where needed. Always redact tokens, cookies, passwords, service keys, signed URLs, raw evidence and customer-bearing prompts.

## Metrics
- request rate, p50/p95 latency, error rate;
- DB connection pool saturation and slow query count;
- queue depth/oldest job/retries/dead letters;
- upload/finalization failures and storage quotas;
- AI provider availability/schema-valid rate/latency/cost when enabled;
- report render failures/idempotency collisions;
- closure guard blockers and stale-version conflicts.

Alert on sustained errors, auth failures, worker backlog, backup failure, upload anomalies and any suspected cross-tenant exposure. Avoid including case text or file URLs in alerts.

Product analytics must be tenant-aware and contract/privacy compliant. Low reopen rate alone does not prove effective fixes; measure recurrence over defined windows and compare against a measured baseline.
