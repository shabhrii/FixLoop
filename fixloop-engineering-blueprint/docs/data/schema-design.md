# Schema design rules

## Aggregate
`QualityCase` is the lifecycle aggregate. Status, version and audit history are coordinated in a service transaction. Findings, Why steps, actions and verification checks have stable IDs because they need their own provenance.

## Indexes/uniqueness
- Unique auth subject, normalized email, tenant slug.
- Unique Membership `(tenantId,userId)`.
- Unique Site `(tenantId,name)` and composite `(id,tenantId)` for safe tenant-qualified FKs.
- Unique QualityCase `(id,tenantId)` and `(tenantId,caseNumber)`.
- Index cases by `(tenantId,status,updatedAt)`, `(tenantId,siteId,createdAt)`, `(tenantId,category,status)`.
- Index actions by `(tenantId,assigneeId,status,dueAt)`.
- Index audit by `(tenantId,entityType,entityId,createdAt)` and `(tenantId,createdAt)`.
- Index evidence by `(tenantId,caseId,createdAt)` and unique object key.
- Unique WhyStep `(tenantId,investigationId,stepNumber)`.
- Reports need tenant-scoped idempotency uniqueness.

## Tenant consistency
Store `tenantId` on every tenant-owned entity even if derivable from a parent. Use composite foreign keys where possible and validate parent/child tenant match in service too. Prisma unique constraints don't automatically implement RLS policies.

## Migration policy
Every schema change gets a reproducible migration; RLS policies/indexes may require reviewed SQL migration. Test a clean database and upgrade from previous version. Never make undocumented production-console schema edits.

## Case-number generation
Do not use `count(*)+1`. Use a tenant-scoped sequence/counter incremented inside a transaction or use a globally unique short ID plus tenant prefix. Internal immutable ID is distinct from human-facing number.
