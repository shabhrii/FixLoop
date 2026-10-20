# Blueprint index and artifact status

| Artifact | Status | Purpose |
|---|---|---|
| Product requirements, roles, lifecycle and acceptance criteria | Proposed specification | Product behavior and measurable expectations |
| Architecture and data-flow decisions | Proposed design | Components, trust boundaries and engineering rationale |
| Prisma schema | Draft implementation contract | Candidate relational model; validate with pinned Prisma version before migrations |
| RLS SQL | Illustrative pattern | Requires host-specific review, role/grant setup and cross-tenant tests |
| OpenAPI | Proposed v1 API contract | Main REST operations and selected schemas; expand and validate before code generation |
| AI JSON Schema | Proposed untrusted-output contract | Constrains model output; does not establish truth or authorize action |
| Security, test and operations docs | Release-gate plans | What must be demonstrated before pilot data |
| `planned-repository/` READMEs | Directory/module specs | Explain the smallest planned code folders without pretending code is present |
| File responsibility matrix | File-level design | Invariants for pages, routes, components, services, jobs and tests |
| Application source code | **Not included** | This package is a blueprint, not a running product |

## Validation gates before implementation is considered deployable

1. Pin Node.js, Next.js, Prisma, PostgreSQL and auth/storage SDK versions.
2. Run `prisma validate`, generate client, review SQL migration output and apply to a disposable PostgreSQL instance.
3. Adapt `prisma/rls.sql` to actual connection roles and verify it cannot be bypassed via pooled connections or a privileged application role.
4. Validate OpenAPI and JSON Schema with selected tooling; contracts must match implementation.
5. Build end-to-end tenant-isolation, evidence-authorization and closure-guard tests before pilot data.
6. Keep every deck claim/demo value distinct from observed pilot evidence and instrument actual baseline/after metrics.
