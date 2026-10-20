# Planned module contract

Case collection API. GET uses deterministic bounded pagination and tenant-scoped filters. POST creates a DRAFT owned by the verified actor; the body cannot choose reporter, tenant, status, case number or version.

**Implementation status:** specification only. Implement as a thin route/screen/module consistent with the parent README and `docs/file-specs/file-responsibility-matrix.md`.
