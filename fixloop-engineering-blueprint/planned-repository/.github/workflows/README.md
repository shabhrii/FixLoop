# CI workflows

`ci.yml` installs the pinned runtime/dependencies from lockfile; runs lint, type-check, unit tests, schema validation, DB integration tests where safely provisioned, and production build. PR workflows must not receive production credentials. Deployment and database migration permissions should be separate from untrusted pull-request CI. Upload only safe test artifacts, never `.env` files or user evidence.
