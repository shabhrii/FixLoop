# FixLoop Remaining Blockers & Production Readiness Review

**Document Reference:** FL-ENG-BLOCKERS-2026.1  
**Target Review:** Factory Pilot Readiness vs. Enterprise GA Launch Requirements  
**Status:** ACTIVE AUDIT  
**Date:** October 20, 2026  

---

## 1. Summary Status

FixLoop's core defect-to-verified-closure workflow, multi-tenant isolation, role-based state machine, and evidence handling are fully implemented, verified, and hardened.

The codebase is **READY for a single-host factory pilot**, subject to the operational prerequisites identified below. Broad enterprise GA rollout requires addressing cluster-level infrastructure items.

---

## 2. Factory Pilot Prerequisites (Mandatory before shop-floor pilot)

| Item | Severity | Category | Description & Operational Resolution |
|---|---|---|---|
| **Production Auth Secret** | High | Security | The local development `.env` currently uses a development placeholder for `AUTH_COOKIE_SECRET`. For a live pilot, a cryptographically random 32+ character string must be set in the deployment environment. |
| **Pilot Backup Routine** | High | Data Durability | When operating in single-host local storage mode (`local-evidence/` and `.pgdata/`), an automated daily backup job (e.g. `pg_dump` and rsync) must be scheduled on the host OS to prevent physical disk loss. |
| **Plant Site Setup** | Medium | Operations | Replace synthetic fixtures (*Apex Precision Components* / *Pune Machining Plant*) with the real pilot factory's site names, machining cell IDs (e.g. CNC lathe, milling cells), and operator accounts via `/app/admin/sites`. |
| **Factory Network TLS** | Medium | Infrastructure | In a shop-floor deployment, ensure the reverse proxy (Nginx / Caddy / Cloudflare) supplies a valid TLS certificate for HTTPS on mobile devices. |

*Note: No architectural code changes are required for these pilot prerequisites; they represent standard operational provisioning.*

---

## 3. Enterprise GA Requirements (Required for Multi-Site Production Rollout)

| Item | Severity | Category | Description & Roadmap Path |
|---|---|---|---|
| **Distributed Rate Limiting** | Medium | Security | The current in-memory rate limiter protects single-instance deployments. Horizontally autoscaled multi-pod deployments require a shared store (e.g. Redis or PostgreSQL token bucket) to aggregate attempt counters across replicas. |
| **Cloud Object Durability** | Medium | Infrastructure | For multi-instance containers, local storage (`local-evidence/`) must be switched to cloud object storage (AWS S3 or Supabase Storage) to ensure cross-pod consistency and multi-region durability. |
| **Legal Entity & DPA** | Low | Compliance | Replace parameterized legal disclaimers (`process.env.NEXT_PUBLIC_OPERATOR_NAME`) with formal registered corporate details, jurisdiction, and execute bilateral Data Processing Agreements (DPAs) with enterprise customers. |
| **High Availability DB** | Medium | Database | Configure managed PostgreSQL with automated point-in-time recovery (PITR) and read replicas. |

---

## 4. Optional Polish & Deferred Enhancements

| Item | Severity | Status | Impact |
|---|---|---|---|
| **Cloudflare Turnstile** | Low | Deferred | Fully optional. Honeypot traps and IP rate limiting provide baseline bot defense. Turnstile can be activated via environment variables (`TURNSTILE_SECRET_KEY`) if public login traffic justifies it. |
| **External Web Analytics** | Low | Deferred | Inactive by design. The privacy wrapper prevents factory telemetry leaks. A real Google Analytics / Plausible ID can be supplied when a public marketing measurement plan is defined. |
| **Offline Sync / Queue** | Low | Deferred | The application is an online-first PWA. Full offline queueing with bidirectional merge conflict resolution is an advanced roadmap item that does not block current connected factory operations. |
