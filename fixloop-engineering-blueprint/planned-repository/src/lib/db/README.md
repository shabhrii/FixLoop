# Database adapter

`prisma.ts` creates one server-only Prisma client per process/runtime as appropriate for the deployment and configures pool limits. Expose no client to browser bundles. Ensure serverless connection pooling matches provider recommendations; use explicit transactions for case transition + audit write. RLS is defense in depth and must be exercised with the real non-owner application DB role.
