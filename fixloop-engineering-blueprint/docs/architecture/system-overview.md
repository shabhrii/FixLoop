# System architecture

```text
Mobile/Desktop browser (responsive Next.js PWA)
        | HTTPS + authenticated session
        v
Next.js API route handlers (/api/v1)
  | session resolver (Supabase Auth)
  | active tenant membership + central RBAC
  | Zod validation + rate limits + typed errors
  v
Domain services (case / investigation / action / verification / evidence / AI / report / search)
  |--> Prisma --> PostgreSQL (tenant-qualified rows + RLS)
  |--> Audit writer (same transaction for critical decisions)
  |--> Private storage adapter (signed URLs only)
  |--> durable queue/outbox --> pg-boss worker
  |--> AI adapter --> configured external provider (minimal, disclosed payload)
  |--> report service --> approved snapshot --> PDF --> private storage
```

## Request sequence

1. Browser sends untrusted request data with a session.
2. Server verifies the Supabase identity and maps it to internal `User`.
3. Server resolves active tenant `Membership`, checks capability, then validates route/query/body.
4. Domain service verifies parent/child relationships and case state. Every DB operation carries tenant scope.
5. Critical mutations + audit event commit atomically; version guard prevents stale overwrite.
6. External/slow work is queued after commit through an outbox or a documented idempotent post-commit mechanism.
7. Worker reloads canonical data with tenant scope. AI/report workers cannot make quality decisions.
8. Server returns a typed DTO, never raw Prisma rows, service keys, private object keys or provider payloads by default.

## Boundaries

- Browser: display/forms only; role/status/verifier/object ownership are not client authority.
- Route: HTTP parsing, auth context, input validation, rate limits and error mapping.
- Services: business rules, policy, transactions and audit.
- Database: canonical business state and durable job metadata.
- Storage: private binary files and report artifacts; object key is not a public URL.
- AI adapter: bounded provider call, strict parsing and normalized errors.
- Report renderer: uses a typed approved snapshot only; it does not infer facts.

## Deployment shape

Use a managed Node-compatible deployment for Next.js, hosted PostgreSQL/Auth/Storage, and a separate long-running worker if app hosting is serverless. A normal request must not be kept alive to perform PDF/AI work. Put secrets in a hosting secret manager.

## Failure behavior

AI failure must not block manual intake. Upload failure means evidence is not AVAILABLE/proof. PDF failure changes report job only, never case status. If audit insert fails during close/reopen/confirm/verify, roll back the business mutation. If reliable async delivery is required, persist an outbox event transactionally so a process crash cannot silently lose the job.
