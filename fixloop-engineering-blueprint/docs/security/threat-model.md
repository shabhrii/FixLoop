# Threat model

## Assets
Defect records, production measurements, confidential photos, part/machine/supplier names, user identities, quality decisions, action proof, signed URLs, secrets and audit history.

## Threats and controls

| Threat | Control |
|---|---|
| Cross-tenant access | Active membership, object-level authorization, tenant-qualified queries, RLS, composite constraints, A/B tests |
| Privilege escalation | Central policy, allow-listed patches, server-owned actor/status, dedicated confirm/verify/close commands |
| Malicious or oversized file | Content allow-list, file-header validation, size limits, private storage, finalization checks, rate limits, optional malware scan |
| AI prompt injection/hallucination | Untrusted-input framing, minimal bounded context, strict schema, no privileged tools, hypothesis labels and human gate |
| Secret leakage | Secret manager, no client-side service key, redacted logs and rotation runbook |
| Stale overwrite | Expected-version/If-Match guard; 409 on conflict |
| Duplicate jobs/reports | Idempotency keys, bounded retries and database uniqueness |
| Audit tampering | Append-only app API, DB grants, atomic audit for critical decisions, backups |
| Demo data mistaken for live | Synthetic fixtures isolated to demo tenant and visibly marked |
| AI-provider leakage | Disclose provider, review terms/region/retention, minimal payload, disable switch, verify no-training settings |

Limit/rate-cap login, invites, AI, upload-intents, search and PDF generation. Apply storage/job quotas. Don't log user note bodies or signed URLs into alerts.

## Residual risks to resolve with each pilot customer

Retention/deletion duties, quality/certification procedures, malware scanning, shared shop-floor devices, SSO/MFA, outages, AI provider contract, data residency and incident notification are deployment/customer-specific and cannot be resolved from ideation alone.
