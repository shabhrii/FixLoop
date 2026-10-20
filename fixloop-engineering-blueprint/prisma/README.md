# Database artifacts

- `schema.prisma` is a candidate relational model and must pass validation against a pinned Prisma version. Generate and inspect migrations on a disposable PostgreSQL instance before use.
- `rls.sql` is a security design pattern, not a turn-key production migration. Adapt database roles, grants, policies and tenant-context lifecycle to the chosen host and verify using the non-owner application role.

Before accepting real factory data, verify composite tenant foreign keys, uniqueness, deletion semantics, audit append-only privileges, connection pooling and backups. No migration is included here; migration history is generated only after the schema is reviewed.
