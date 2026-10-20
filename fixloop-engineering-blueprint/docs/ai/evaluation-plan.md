# AI evaluation plan

Use synthetic cases and customer-approved/de-identified examples only. Fixtures include missing values, contradictory measurements, typos, ambiguous defects and prompt-injection content.

Measure factual consistency, invented details, allowed-category correctness, usefulness of evidence-seeking questions, schema-valid rate, p50/p95 latency/cost, human accept/edit/reject outcomes, harmful suggestion reports and cross-tenant context leakage.

Release checks: 100% of responses validated before display; no path allows AI to close/confirm/approve; missing data remains missing; prompt-injection tests cannot access secrets/other tenants because those contents are never placed into model context; a human reviewer signs off on cause-suggestion changes. Set latency/quality/cost thresholds only after a baseline exists.
