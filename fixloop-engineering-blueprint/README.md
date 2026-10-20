# FixLoop — Engineering Blueprint

**Purpose:** an implementation-ready specification and repository map for turning the uploaded IncubeX FixLoop ideation into a working MVP.

> **Status distinction:** the deck describes FixLoop as an idea and explicitly labels its architecture as planned, not built. This archive is a blueprint, not a claim that application code is already implemented or tested.

## Product in one sentence

FixLoop is a mobile-first defect-investigation and corrective-action workflow for small manufacturers: report a defect with evidence, investigate it, assign an accountable action owner, verify effectiveness, and retain the verified case for future learning.

## Read in this order

1. `docs/00-source-boundaries-and-decisions.md` — deck-derived requirements versus added engineering decisions.
2. `docs/product/PRD.md` — functional and non-functional requirements.
3. `docs/product/workflow-and-state-machine.md` — allowed case states/transitions and closure guards.
4. `docs/architecture/system-overview.md` — service boundaries and runtime flow.
5. `docs/data/data-dictionary.md` and `prisma/schema.prisma` — domain records.
6. `contracts/openapi.yaml` — proposed REST API; `contracts/ai-suggestion.schema.json` — AI output contract.
7. `docs/security/tenant-isolation.md` and `docs/ai/AI-safety-contract.md` — security-critical rules.
8. `docs/implementation/build-order.md` — coding order and gates.
9. `FILE_TREE.md` and `docs/file-specs/file-responsibility-matrix.md` — intended repo and per-file responsibilities.

## Concrete MVP choices

- Next.js App Router + React + TypeScript for responsive PWA and REST route handlers.
- PostgreSQL with Prisma for relational data and transactions.
- Supabase Auth for identity; app roles stored as tenant memberships.
- Private Supabase Storage bucket and expiring signed upload/download URLs for evidence.
- `pg-boss` or equivalent PostgreSQL-backed queue for AI/report jobs.
- Provider-neutral AI adapter, strict schema validation, and deterministic mock provider for local development.
- Server-side PDF generation from approved values and a versioned snapshot.
- PostgreSQL full-text/trigram search over closed cases first; no vector database required for MVP.

These are explicit engineering decisions made to make implementation concrete; they are not claims in the deck.

## MVP completion rule

A meaningful MVP supports a full defect case from submission through investigation, proof-backed actions, effectiveness review, closure, PDF export and closed-case search. Failed/inconclusive verification must block closure. Tenant A must not read or mutate tenant B data. AI must never directly confirm a cause, approve effectiveness, close/reopen a case or release production.

## Package contents

- `docs/` — product, architecture, API, data, AI, security, frontend, operations, testing and implementation specifications.
- `contracts/` — proposed OpenAPI and AI JSON Schema.
- `prisma/` — draft relational schema and RLS policy pattern requiring host-specific validation.
- `planned-repository/` — folder READMEs at intended source paths, including smaller modules.
- `FILE_TREE.md` and `docs/file-specs/file-responsibility-matrix.md` — annotated source tree and file-level contracts.
- `.env.example` — variable names only; no real secrets.
- `AGENTS.md` — rules for a coding agent/team implementing the plan.

## Explicit non-goals for the first MVP

FixLoop is not an ERP/MES replacement, autonomous root-cause engine, machine-control system, certification authority or automatic production-release system. Offline write-sync, ERP connectors, embeddings, complex workflow builders and large-scale analytics are deferred until discovery or paid pilots justify them.
