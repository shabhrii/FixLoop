# Tenant isolation — security-critical contract

## Threat
An authenticated user guesses another tenant's case/action/evidence/report ID and calls the API directly. Hidden UI links and random IDs are not authorization.

## Required layers

### Identity and active membership
- Verify Supabase session server-side each request (use provider's verified user method rather than trusting decoded client state).
- Map verified auth subject to internal `User`.
- Actor comes from session; never trust body `userId`, `role`, `tenantId` or `membershipId`.
- Resolve an active Membership for the requested tenant on every tenant operation.

### Object-level authorization
- Load objects with both tenant and ID in the query; e.g. `findFirst({ where: { id: caseId, tenantId } })`.
- Verify parent-child tenant consistency for site, case, evidence, action, finding, investigation, check and report.
- Check capabilities for each operation, including assigned-action ownership; don't expose another tenant's object fields in error paths.
- PATCH schemas must exclude `tenantId`, status, reporter, closedBy, confirmedBy, verifier, objectKey and audit fields unless the operation is a specific privileged command.

### PostgreSQL RLS defense-in-depth

A practical design is transaction-local `app.current_tenant_id` and `app.current_user_id`, set only from verified actor context, with tenant predicates on every query. Example pattern:

```ts
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
  // Use tx for all queries in this scope.
});
```

This works only after validating actual PostgreSQL roles/policies. Runtime role must not bypass RLS; ensure table-owner/superuser behavior is understood and FORCE RLS is applied as appropriate. The transaction-local flag matters with pooled connections; don't use session-global variables on pooled connections. A caller-set GUC alone is not a secure authorization mechanism: only trusted server code can set it, and database grants/role boundaries are essential.

`prisma/rls.sql` is a policy pattern, not a turnkey migration. Authenticated membership discovery and global identity tables require separate policies; do not blindly apply a tenant-only policy to every table.

### Storage

- Keep bucket private. Server checks membership + case before issuing signed upload/download.
- Server generates exact object key; client cannot choose tenant prefix/path.
- Short expiry; verify object on finalize; service-role key never goes into browser bundle.

## Mandatory tests

Tenant A reads A = allowed; reads B = generic 404; mutates B = denied; requests B upload/download URL = denied; B evidence cannot attach to A case; inactive membership denied; insufficient role denied; changing user/role/tenant in body has no effect; search/count doesn't leak B; RLS denies accidental unscoped reads under actual runtime role and pooled connection.

## Release gate

Don't store real pilot evidence until the above tests run against production-equivalent database role, RLS, app and storage configuration.
