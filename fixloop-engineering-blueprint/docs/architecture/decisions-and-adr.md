# Architecture decisions and alternatives

## ADR-001 — One Next.js application for MVP
**Decision:** Next.js App Router + TypeScript for UI and versioned REST routes. Shared schemas and one deployment reduce overhead. Keep business rules in service modules to allow extraction later. A separate Fastify/Nest API is a later option if integration/volume/team boundaries justify it.

## ADR-002 — PostgreSQL + Prisma
PostgreSQL is canonical storage; Prisma is the typed ORM. RLS policies and some indexes use reviewed SQL migrations. ORM typing does not replace explicit tenant authorization.

## ADR-003 — Supabase Auth + private Storage
Use Supabase Auth for identity and Storage for private evidence/report bytes. An authenticated session proves identity, not membership or quality permission. Never expose service-role credentials to the browser. Sign URLs only after server authorization and expire them quickly.

## ADR-004 — PostgreSQL-backed job queue
Use `pg-boss` or equivalent for AI/report jobs; operate a separate worker where the deployment host is serverless. Use at-least-once + idempotent handlers, not an exactly-once assumption.

## ADR-005 — AI as optional suggestion service
Provider-neutral interface, mock local provider, strict output schemas, provenance and human decision record. Model output cannot confirm cause, approve effectiveness, close/reopen or release a product.

## ADR-006 — PostgreSQL closed-case search first
Use PostgreSQL full-text/trigram over approved fields, scoped by tenant. Defer embeddings because they add cost/privacy/retrieval complexity before evidence of demand.

## ADR-007 — No offline writes in first pilot
Make the PWA responsive/installable, but keep server state canonical and don't promise confidential offline submission. Offline synchronization needs a separate plan for stale versions, shared devices, local encryption, retention and evidence retries.
