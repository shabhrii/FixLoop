# FixLoop Evidence Storage & Cryptographic Verification Audit

**Document Reference:** FL-SEC-STORAGE-AUDIT-2026.1  
**Audit Target:** Evidence Uploads, Private Storage Driver, HMAC Capability Tokens, and Integrity Controls  
**Status:** VERIFIED & HARDENED  
**Date:** October 20, 2026  

---

## 1. Storage Architecture Overview

Manufacturing defect photographs, calibration certificates, CMM measurement logs, and corrective action proofs contain proprietary technical data. FixLoop implements a private, capability-based storage architecture:

```
[Client / PWA] 
      │ (1) Request Upload Intent
      ▼
[FixLoop API] ──(Checks Auth & Quota)──► Generates Server ObjectKey
      │ (2) Issues Signed HMAC JWT
      ▼
[Client / PWA] ──(3) PUT /api/v1/storage/transfer?token=...──► [Storage Endpoint]
                                                                     │
                                                       (Verifies HMAC & writes bytes)
                                                                     ▼
                                                             [local-evidence/]
```

### Storage Driver Modes:
1. **Local Disk Storage (`local-evidence/`)**: Default driver for local development and single-host on-premise factory pilots. Operates without external cloud dependencies.
2. **Cloud Object Storage (Supabase / S3)**: Configurable for multi-site enterprise deployments requiring geographically distributed object durability.

---

## 2. Cryptographic Token Signing & Verification

FixLoop uses JSON Web Tokens signed with HMAC-SHA256 (`HS256`) via `jose` to authorize file transfers.

### Token Payload Structure:
```json
{
  "tenantId": "cmvgbj0wt0006f848y9jyvlzx",
  "caseId": "cmvgbj0y5000af84869i761u1",
  "objectKey": "tenants/cmvgbj.../cases/cmvgbj.../uuid-v4.png",
  "operation": "UPLOAD",
  "exp": 1729421500
}
```

### Key Security Properties:
1. **Server-Generated Object Keys**: Clients cannot specify arbitrary storage keys, prefixes, or filenames. Keys follow strict server-enforced hierarchy: `tenants/{tenantId}/cases/{caseId}/{uuid}{ext}`.
2. **Operation Binding**: Tokens are strictly scoped to either `UPLOAD` or `DOWNLOAD`. An upload token cannot be re-used to read files from storage.
3. **Strict Time-to-Live (TTL)**: Tokens expire after 300 seconds (`SIGNED_URL_TTL_SECONDS=300`). Expired signatures are rejected by `jwtVerify`.
4. **Signature Secret Security**: Signed using `AUTH_COOKIE_SECRET` on the server. The secret is never delivered to client browsers or mobile PWAs.
5. **Path Traversal Defense**: `PrivateStorage.resolveSafePath(objectKey)` resolves the absolute path against `LOCAL_STORAGE_ROOT` and verifies that the target remains inside the authorized directory, blocking directory escape attacks (`../../etc/passwd`).

---

## 3. Important Distinctions: Integrity vs. Encryption at Rest

> [!IMPORTANT]
> **HMAC tokens provide authentication, authorization, and message integrity. They do not encrypt file contents on the storage disk.**

- **Data in Transit**: Encrypted via TLS 1.3 with mandatory HTTPS redirection and `Strict-Transport-Security` headers.
- **Data at Rest**:
  - In local storage mode (`local-evidence/`), file confidentiality at rest relies on host operating system file permissions and underlying block-level disk encryption (e.g. BitLocker on Windows, LUKS / dm-crypt on Linux).
  - In cloud storage mode (S3 / Supabase), files are protected via server-side encryption (AES-256 / SSE-S3).
  - FixLoop does not currently claim per-tenant customer-managed encryption keys (CMEK); this is an enterprise-tier roadmap capability.

---

## 4. Evidence Finalization & SHA-256 Checksums

Evidence does not become available immediately upon byte upload. It undergoes a two-step commit:

1. **Upload Intent Creation**: Status set to `UPLOAD_PENDING`.
2. **Direct Byte Transfer**: File bytes written to storage.
3. **Finalization (`EvidenceService.finalizeEvidence`)**:
   - Inspects physical file on disk.
   - Calculates exact byte size and computes SHA-256 cryptographic digest.
   - Updates database record with `checksumSha256`, `byteSize`, and marks status `AVAILABLE`.
   - Records an immutable `EVIDENCE_FINALIZED` audit event.

If an upload is aborted or corrupted, finalization fails and unverified files cannot be linked to corrective actions.

---

## 5. Deployment Topology Risks & Limitations

| Topology | Security & Durability Considerations | Recommendation |
|---|---|---|
| **Local Development** | Safe. Evidence stored in `.pgdata` and `local-evidence/`. Ignored in `.gitignore`. | Suitable for engineering tests. |
| **Single-Host Factory Pilot** | Evidence stored on persistent local SSD. Regular host-level snapshot/backup required. | Fully supported for factory pilot phase. |
| **Multi-Instance Container / Kubernetes** | **RISK**: Local disk is ephemeral. Pod restarts or horizontal autoscaling will cause file loss or replica inconsistency. | **MUST** configure S3-compatible or Supabase persistent object storage before deploying across multiple container replicas. |
| **Serverless (Vercel / Cloudflare Workers)** | **RISK**: Ephemeral read-only root filesystems cannot sustain `local-evidence/`. | **MUST** use cloud object storage driver. |

---

## 6. Audit Conclusion

The evidence storage and capability token pipeline is verified and hardened against path traversal, expired link reuse, and unauthorized cross-tenant object access.
