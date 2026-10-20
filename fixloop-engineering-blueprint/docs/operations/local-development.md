# Local development workflow

## Prerequisites
Node.js LTS compatible with chosen Next version; pnpm or one consistently selected package manager; PostgreSQL/Supabase; configured Supabase Auth and private Storage for E2E tests. Real AI key is optional; mock provider is default.

## Setup order
1. Copy `.env.example` to `.env.local`; never commit it.
2. Configure DB runtime and migration credentials, Supabase Auth URL/keys and private storage bucket.
3. Install from a committed lockfile.
4. Generate Prisma client and migrate a disposable database.
5. Review/adapt RLS policies and role grants; do not apply sample SQL blindly.
6. Seed only a clearly marked synthetic demo tenant.
7. Run format/lint/typecheck/unit/integration/schema tests and start web app.
8. Test sign-in, membership, intake, upload/finalize/download, all transitions, proof guard, effectiveness, close/reopen, report and tenant A/B denial.

## Secrets/data hygiene
Use separate dev/staging/prod resources, never `NEXT_PUBLIC_` for secret fields, rotate any leaked credential, and avoid copying production records to laptops. Synthetic fixtures are the default.
