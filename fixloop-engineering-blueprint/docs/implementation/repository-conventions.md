# Repository conventions

- Routes in `src/app/api/v1`; OpenAPI lives in `contracts/openapi.yaml`.
- Central Zod validation; never use `as any` to ignore contract mismatch.
- Routes are adapters; business rules live in services; role/state logic lives in policies.
- Use business-command names (`closeCase`, `confirmFinding`) rather than unrestricted DB verbs (`updateStatus`).
- Persist UTC; convert to site timezone in UI.
- Every tenant-owned row and query carries tenantId. Explain any global table.
- Keep original AI suggestion and human decision separate.
- Status/enum changes require tests, migration and release note.
- Fixtures are synthetic and visibly marked demo.
- Never log full notes/prompts/signed URLs by default.
- New routes update OpenAPI, auth/RBAC tests and responsibility matrix.
