# Database schema and migrations

`schema.prisma` is a draft candidate data model. Pin the Prisma version, validate it, generate migrations on a disposable PostgreSQL database and inspect SQL before use. `rls.sql` is an illustrative pattern, not a complete security deployment: define least-privileged roles, safe tenant context lifecycle, transaction-pool compatibility and restrictive policies. `seed.ts` should generate fake users/cases only and must refuse production execution. Commit every migration; do not edit previously applied migrations.
