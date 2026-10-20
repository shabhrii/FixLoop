# Tenant-scoped API route family

`[tenantId]` is a locator, not proof of access. Every handler must verify that the authenticated actor has active membership in this exact tenant, then verify site/case/evidence/action relationships are within it. Prefer `404` when disclosure of another tenant's resource existence is unsafe. All list/search endpoints impose page limits and explicit sort order.
