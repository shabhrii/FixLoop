# FixLoop Application Route Inventory & Policy Matrix

**Document Reference:** FL-SEC-ROUTE-INV-2026.1  
**Classification:** Internal Technical Architecture  
**Audit Date:** October 20, 2026  
**Auditor:** FixLoop Application Security & QA Engineering  

---

## 1. Overview & Classification Schema

This document provides a comprehensive inventory of all client routes and API endpoints in the FixLoop platform. Each route is classified across five dimensions:
1. **Route Type**: Public Marketing, Authentication, Authenticated Application, Tenant Resource, Admin, Storage/Evidence, Error.
2. **Authentication Required**: None, Session JWT (`fixloop_session` HttpOnly cookie), or HMAC capability token.
3. **Authorization Rule**: Policy check required (RBAC: `QUALITY_ENGINEER`, `OPERATOR`, `ACTION_OWNER`, `TENANT_ADMIN`, `AUDITOR`).
4. **Search Indexing Policy**: Allowed in `robots.txt` / `sitemap.xml`, or blocked via `robots.txt` disallow and `X-Robots-Tag: noindex, nofollow, noarchive` headers.
5. **Analytics & Telemetry Policy**: Allowed (strictly opt-in via Cookie Consent Banner) vs. Strictly Prohibited (in-product factory workspace).

---

## 2. Public & Authentication Routes

| Route Path | Type | Auth Required | Authorization Policy | Indexing Policy | Analytics Policy |
|---|---|---|---|---|---|
| `/` | Public Marketing | None | None (Public access) | Indexable (Allowed in `robots.txt` & `sitemap.xml`) | Opt-in strictly upon cookie consent |
| `/login` | Authentication | None | Unauthenticated (Redirects to `/app` if active session) | Allowed in `robots.txt` & `sitemap.xml` | Opt-in strictly upon cookie consent |
| `/privacy` | Legal / Policy | None | None (Public access) | Allowed in `robots.txt` & `sitemap.xml` | Opt-in strictly upon cookie consent |
| `/terms` | Legal / Terms | None | None (Public access) | Allowed in `robots.txt` & `sitemap.xml` | Opt-in strictly upon cookie consent |
| `/robots.txt` | Crawler Metadata | None | None | Public metadata endpoint | Never tracked |
| `/sitemap.xml` | Discovery Metadata | None | None | Public metadata endpoint | Never tracked |
| `/manifest.json` | PWA Manifest | None | None | Public asset | Never tracked |
| `/*` (Non-existent) | Error / 404 | None | None (Custom Not-Found component) | Disallowed (`noindex, nofollow`) | Never tracked |

---

## 3. Authenticated Factory Workspace Pages (`/app/*`)

*Note: Grouped under `src/app/(workspace)/app/`. All pages require active session and valid active membership. Search indexing is strictly blocked via `X-Robots-Tag: noindex, nofollow, noarchive` and `robots.txt` disallow. External marketing analytics are strictly forbidden.*

| Route Path | Sub-component / Purpose | Min Role Required | Indexing Policy | Analytics Policy |
|---|---|---|---|---|
| `/app` | Workspace Dashboard / Case Metrics | Any Active Member | Disallowed (`noindex`) | **PROHIBITED** (Zero factory telemetry) |
| `/app/cases` | Active Defect Queue & Triage Filters | Any Active Member | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/cases/new` | Defect Intake & Photo Attachment Form | `OPERATOR`, `QUALITY_ENGINEER`, `TENANT_ADMIN` | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/cases/[caseId]` | Case Investigation, 5-Why, CAPA, Verification & Closure | Any Active Member (Mutations role-gated) | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/actions` | Remediation Owner Task Queue | Any Active Member (Assigned to action owner) | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/library` | Closed Case Knowledge Search & Lessons Learned | Any Active Member | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/admin/members` | Tenant Membership & Personnel Roles | `TENANT_ADMIN` | Disallowed (`noindex`) | **PROHIBITED** |
| `/app/admin/sites` | Factory Site & Machining Cell Setup | `TENANT_ADMIN` | Disallowed (`noindex`) | **PROHIBITED** |

---

## 4. API Endpoints (`/api/v1/*`)

*All API routes return JSON responses with security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-Robots-Tag: noindex`).*

### 4.1 Authentication & System Health

| Endpoint | Method | Purpose | Auth Required | Rate Limiting |
|---|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Passwordless / credential exchange session JWT | None (Public) | In-memory sliding window: 15 req/min per IP |
| `/api/v1/auth/logout` | `POST` | Invalidates session cookie | None (Clears cookie) | Standard |
| `/api/v1/healthz` | `GET` | Container / load balancer liveness probe | None | None |
| `/api/v1/me` | `GET` | Active user identity and tenant memberships | Session JWT | Standard |

### 4.2 Storage & Evidence Transfer

| Endpoint | Method | Purpose | Capability Verification |
|---|---|---|---|
| `/api/v1/storage/transfer` | `GET` | Evidence download proxy | Signed HMAC JWT token (`operation: DOWNLOAD`, TTL ≤ 300s) |
| `/api/v1/storage/transfer` | `PUT` | Direct evidence byte upload | Signed HMAC JWT token (`operation: UPLOAD`, TTL ≤ 300s) |

### 4.3 Tenant & Quality Workflow Resources (`/api/v1/tenants/[tenantId]/*`)

*Every endpoint validates session, membership in `[tenantId]`, and object ownership. Cross-tenant access returns a non-revealing 404.*

| Endpoint | Methods | Primary Operation | Policy Check / Role Gate |
|---|---|---|---|
| `.../sites` | `GET`, `POST` | List / create plant sites | Admin for `POST`, Active member for `GET` |
| `.../cases` | `GET`, `POST` | Query queue / submit defect intake | Validated by `CreateCaseSchema`, honeypot check |
| `.../cases/[caseId]` | `GET`, `PATCH` | Read case / update metadata | Tenant isolation check (`where: { id, tenantId }`) |
| `.../cases/[caseId]/submit` | `POST` | Transition draft to `SUBMITTED` | Version guard check |
| `.../cases/[caseId]/triage` | `POST` | Classify severity & containment | `QUALITY_ENGINEER` or `TENANT_ADMIN` |
| `.../cases/[caseId]/investigation` | `GET`, `PUT` | Read / update investigation notes | Active member / QE |
| `.../cases/[caseId]/investigation/why-steps` | `POST`, `PUT`, `DELETE` | 5-Why root cause isolation tree | Active member |
| `.../cases/[caseId]/findings` | `GET`, `POST` | List / add diagnostic findings | Kind: `FACT`, `AI_HYPOTHESIS`, `TESTED`, `CONFIRMED` |
| `.../cases/[caseId]/findings/[findingId]/confirm` | `POST` | Confirm root cause with rationale | **Quality Engineer ONLY** (AI blocked) |
| `.../cases/[caseId]/ai-suggestions` | `GET`, `POST` | Request untrusted AI hypotheses | Suggestion sandbox (no quality authority) |
| `.../cases/[caseId]/ai-suggestions/[id]/decision` | `POST` | Human Accept / Edit / Reject | Explicit human review recorded |
| `.../cases/[caseId]/actions` | `GET`, `POST` | Assign containment/corrective tasks | Active member / QE |
| `.../cases/[caseId]/actions/[id]/complete` | `POST` | Complete action with proof IDs | Assignee or QE with verified proof |
| `.../cases/[caseId]/evidence/upload-intents` | `POST` | Issue signed upload URL | File size, mime, and case association |
| `.../cases/[caseId]/evidence/[id]/finalize` | `POST` | Finalize upload after byte write | Size and SHA-256 inspection |
| `.../cases/[caseId]/effectiveness-checks` | `GET`, `POST` | Record statistical verification | QE review (`EFFECTIVE` vs `NOT_EFFECTIVE`) |
| `.../cases/[caseId]/close` | `POST` | Authorize formal case closure | **Quality Engineer ONLY** + all gates satisfied |
| `.../cases/[caseId]/reopen` | `POST` | Reopen closed/ineffective case | Quality Engineer or Admin + rationale |
| `.../cases/[caseId]/reports` | `GET`, `POST` | Export versioned audit snapshot | Active member; uses human-approved data only |
| `.../cases/[caseId]/timeline` | `GET` | Read immutable audit event log | Active member (`AUDITOR` allowed) |
| `.../closed-cases/search` | `GET` | Query historical closed cases | Scoped strictly to `ctx.tenantId` |
| `.../evidence/[id]/download` | `GET` | Issue signed download URL | Active member in case tenant |

---

## 5. Security & Indexing Audit Conclusion

1. **Crawler Boundaries**: `robots.txt` and `sitemap.xml` strictly restrict search engines to `/`, `/login`, `/privacy`, and `/terms`.
2. **Header Enforcement**: Middleware injects `X-Robots-Tag: noindex, nofollow, noarchive` across all authenticated workspace and API routes.
3. **Analytics Isolation**: Public analytics module (`src/lib/telemetry/analytics.ts`) implements an explicit allowlist. Any event originating from `/app/*` or `/api/*` is discarded before evaluation.
