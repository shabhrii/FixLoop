# Authentication helpers

- `session.ts`: verify provider session/token on the server; resolve external auth subject to internal user; reject disabled/inactive users.
- `tenant-context.ts`: resolve active membership, tenant ID and role from database, not request body; reject missing, inactive or ambiguous tenant context.
- `policy.ts`: centralized capability helper; object-scope checks remain required.

Cookie settings, CSRF strategy and auth-provider configuration must be documented against pinned SDK versions. Never accept a role sent by the browser.
