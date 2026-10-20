# Source boundaries and engineering decisions

## What the submitted deck directly specifies

- Product: FixLoop; Product track; FinTech & GovTech; team ID 1019.
- Initial customer segment: 10–250 employee precision machining, fabrication and auto-component suppliers in Maharashtra clusters.
- Paying customer: factory owner/plant head. Daily users: operators/inspectors, quality engineers, maintenance/production action owners.
- Pain: defect evidence, ownership and verification scatter across paper, chat and Excel; fixes are not always proven effective and defects can return.
- Workflow: **Report → Triage → Investigate → Act → Verify → Close and learn**.
- Intake: photo, note and reading. AI may draft a title/category and suggest possible causes.
- Finding labels: FACT, AI HYPOTHESIS, TESTED, CONFIRMED. A human with evidence confirms a cause.
- Actions require owner, due date and proof. Closure requires an effectiveness check; ineffective cases reopen.
- Containment, cause confirmation, verification and release remain human-owned. FixLoop is not an ERP replacement.
- Planned architecture: React/Next.js PWA; authenticated API with roles, tenant isolation and audit; PostgreSQL, private storage and job queue; schema-validated AI adapter; human review gate; PDF/report engine that uses approved values only.
- Security intent: HTTPS, encryption, private storage, server-side roles, AI provider disclosure, minimal data sent, and no customer-data training by default.
- Market sizing, pricing and savings are assumptions/goals in the deck, not proven product results.

## Engineering decisions added in this blueprint

| Area | MVP decision | Rationale |
|---|---|---|
| App/API | One Next.js App Router app, typed REST under `/api/v1` | Keeps early deployment small while preserving service boundaries |
| DB | PostgreSQL + Prisma; custom SQL migrations for RLS/indexes | Relational integrity and transactions fit the case workflow |
| Identity | Supabase Auth + internal User/Membership | Authentication is separate from tenant authorization |
| Authorization | Central server-side policy, tenant-qualified data access, PostgreSQL RLS defense-in-depth | Reduces IDOR/cross-tenant risk |
| Files | Private Supabase Storage, signed URLs, server-generated object keys | Evidence must not be public |
| Jobs | PostgreSQL-backed queue such as `pg-boss` | Avoids making Redis a mandatory MVP dependency |
| AI | Provider-neutral adapter, mock default, strict schemas | AI is optional and remains a suggestion layer |
| Search | PostgreSQL full-text/trigram first | Simple, explainable, tenant-scoped retrieval |
| PWA | Installable and mobile-first; no promise of confidential offline sync | Offline sync requires a separate conflict/security design |
| Reports | PDF from approved snapshot, case version and checksum | Reproducible exports and auditability |

## Not established by the deck

The deck does not prove the application exists, name a production AI provider, confirm committed factories, validate TAM/SAM/SOM, or show real effectiveness results. The FB-204/VMC-03 defect and 0/150 measurement are illustrative demo data only. Label demo/prototype/pilot/measured results precisely.
