# Data dictionary

| Entity | Purpose | Key invariant |
|---|---|---|
| `User` | Map verified auth identity to internal user | Auth subject unique; actor resolved server-side |
| `Tenant` | Customer organization/security boundary | Stable ID/slug; no cross-tenant access |
| `Membership` | User's role within one tenant | Unique tenant/user for MVP; `isActive` checked per request |
| `Site` | Factory/site/work-cell scope | Unique name within tenant; case site belongs to same tenant |
| `QualityCase` | Defect/NCR lifecycle aggregate | Tenant + site; server case number; status via service; version increments |
| `CaseEvidence` | Private object metadata | Tenant/case match; only AVAILABLE evidence is proof |
| `Finding` | Investigation claim/observation | Explicit type; CONFIRMED requires human/time/evidence or rationale |
| `FindingEvidence` | Finding-evidence relation | Same tenant and case required |
| `Investigation` | 5-Why workspace | One per case for MVP unless later branches are supported |
| `WhyStep` | Ordered why question/answer | Unique step number per investigation; evidence links optional for draft |
| `Action` | Containment/corrective/preventive work | Owner, due, state, creator; complete guard enforces note/proof |
| `ActionEvidence` | Proof relationship | Action and evidence same tenant/case |
| `EffectivenessCheck` | Human review of corrective-action effect | Criterion, sample/window, outcome, reviewer/time/case version |
| `CaseComment` | Attributed context note | Tenant scoped, server timestamps |
| `CaseReport` | PDF artifact metadata | Snapshot case version, checksum, private object, idempotency key |
| `AiSuggestion` | Untrusted proposal and decision record | Schema validated, provider/prompt provenance; decision separate |
| `AuditEvent` | Append-only history | No regular update/delete; critical events atomic with mutation |

## Numeric semantics

- Measurements use PostgreSQL NUMERIC / Prisma Decimal, not JavaScript float as canonical storage.
- Quantities are integers >= 0. If both known, affected <= inspected. Unknown is null, not 0.
- Effectiveness counts require sampleSize >= 0 and 0 <= outOfToleranceCount <= sampleSize. Data informs but doesn't replace human outcome.
- Due time is stored as UTC instant. If customers need local calendar-day semantics, model those deliberately rather than silently converting timezone.

## Deletion

Do not hard-delete a case with dependent quality/audit records under ordinary workflow. Use an explicit archive/retention process. Physical evidence deletion or tenant deletion needs dependency checks, retention policy and audit.
