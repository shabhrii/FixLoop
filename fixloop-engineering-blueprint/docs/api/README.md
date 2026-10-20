# API module

`endpoint-catalog.md` lists planned paths; `errors-and-versioning.md` defines stable failure behavior; `contracts/openapi.yaml` is the structured contract. Tenant IDs in route paths select a workspace but never prove access. New routes need schema validation, auth/RBAC, tenant-isolation tests and a matching OpenAPI update.
