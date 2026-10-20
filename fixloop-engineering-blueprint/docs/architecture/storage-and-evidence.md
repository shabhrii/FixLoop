# Evidence storage contract

## Separation
PostgreSQL stores metadata/relationships; binary file lives in a private bucket. Store an internal object key, never a permanent public URL. Suggested key: `tenant/<tenantId>/case/<caseId>/<randomEvidenceId>/<safeExtension>`; never use raw user filename in path.

## Lifecycle
`UPLOAD_PENDING -> UPLOADED_UNVERIFIED -> AVAILABLE`; failure/expiry becomes `UPLOAD_FAILED` or is cleaned up. Only AVAILABLE evidence may satisfy proof/verification requirements.

1. Upload intent validates membership, case scope, evidence purpose, MIME allow-list and byte limit.
2. Server generates the ID/key and exact-object, short-lived signed capability.
3. Client uploads bytes to private storage.
4. Finalization verifies object exists, matches key/tenant/case, validates metadata/size and preferably inspects file signature/magic bytes rather than trusting browser MIME; optional SHA-256 verifies integrity.
5. Server persists metadata/status and audit event.
6. Download repeats authorization then returns a short-lived signed URL or proxy download.

## Proposed MVP file policy
JPEG/PNG/WebP/PDF only; 15 MiB per file as a starting limit (must match host limits); deny executables, archives and active content until reviewed. Normalize display names and HTML-escape them. Rate-limit upload intents, enforce quotas, and test storage policy in staging.

## Production hardening
Confirm encryption, retention/deletion, object backup/versioning, orphan-file cleanup, malware scanning requirements and incident procedures before real factory data. A DB backup alone doesn't back up evidence. Do not cascade-delete files linked to closed cases without an explicit retention policy.
