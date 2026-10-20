# Test strategy

Test behavior and boundaries, not implementation details. Unit tests are fast and deterministic; integration tests use disposable PostgreSQL and private-storage substitutes or a dedicated test bucket; E2E tests verify the complete role-based flow. Include negative and cross-tenant cases. Synthetic evidence only. Never run destructive test migrations against production.
