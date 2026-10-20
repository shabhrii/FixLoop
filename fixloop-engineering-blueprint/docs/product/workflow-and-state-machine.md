# Workflow and state machine

## Case states

- `DRAFT` — incomplete fields allowed; not submitted.
- `SUBMITTED` — waiting for triage.
- `TRIAGE` — quality role reviews severity, scope, containment and assignment.
- `INVESTIGATING` — finding/evidence/5-Why work in progress.
- `ACTION_IN_PROGRESS` — required actions active.
- `VERIFICATION_PENDING` — required actions complete; effectiveness review awaited.
- `REOPENED` — a closed case reopened with a reason; resumes investigation/action.
- `CLOSED` — effective review and closure conditions passed.
- `CANCELLED` — duplicate/out-of-scope, reason required; history retained.

## Allowed transitions

| From | To | Guard |
|---|---|---|
| DRAFT | SUBMITTED | Reporter can submit; required intake fields pass |
| SUBMITTED | TRIAGE | Quality Engineer accepts into triage |
| SUBMITTED | CANCELLED | Quality Engineer + reason |
| TRIAGE | INVESTIGATING | Scope/category + containment assessment or explicit N/A |
| TRIAGE | CANCELLED | Quality Engineer + reason |
| INVESTIGATING | ACTION_IN_PROGRESS | Investigation documented with action or evidence-based rationale for no action |
| ACTION_IN_PROGRESS | INVESTIGATING | Quality Engineer revises analysis/scope; reason audited |
| ACTION_IN_PROGRESS | VERIFICATION_PENDING | All required actions complete; each has available proof or authorized audited waiver |
| VERIFICATION_PENDING | CLOSED | Effective human review + all closure guards |
| VERIFICATION_PENDING | ACTION_IN_PROGRESS | Outcome NOT_EFFECTIVE; corrective work needed |
| VERIFICATION_PENDING | INVESTIGATING | Outcome INCONCLUSIVE; more analysis required |
| CLOSED | REOPENED | Quality Engineer + recurrence/new-evidence reason |
| REOPENED | INVESTIGATING | Quality Engineer resumes analysis |
| REOPENED | ACTION_IN_PROGRESS | Quality Engineer defines/restarts corrective work |

Unlisted transitions are rejected by a domain service. Generic PATCH cannot assign a status. CLOSED reopens only through an explicit command; CANCELLED and CLOSED otherwise leave the normal edit flow.

## Closure guard (`canClose`)

Require: active membership + Quality Engineer capability; current status VERIFICATION_PENDING; all required actions completed; required proof available or a specifically permitted audited waiver; latest effectiveness check applicable to current case/action version is `EFFECTIVE` and entered by authorized human; required confirmed findings have evidence/rationale per policy; expected version matches; transaction can append the audit event. Status, close timestamp/actor, version increment and audit record commit together.

## Effectiveness semantics

- `EFFECTIVE`: human reviewer says the criterion passed. Validate sample size >= 0 and out-of-tolerance count between 0 and sample size; calculation does not auto-approve.
- `NOT_EFFECTIVE`: never close; return to ACTION_IN_PROGRESS, require explanation/revised work.
- `INCONCLUSIVE`: never close; gather more sample/time/analysis and remain open.

The deck's next-three-lots/0-of-150 example is demonstration data only.

## Concurrency/idempotency

Every aggregate mutation uses `expectedVersion` or `If-Match`; stale writes return 409. Retriable POST commands accept an `Idempotency-Key` scoped to tenant + actor + request hash. Never use `count(*)+1` for case-number generation; use a transactional tenant counter or safe public ID.
