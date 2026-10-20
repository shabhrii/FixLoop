-- SECURITY PATTERN ONLY. Review/adjust for the selected PostgreSQL host and runtime role.
-- Do not apply blindly to a production Supabase project. RLS is useful only if queries run
-- as a role that cannot bypass RLS and policy/grant behavior is verified.

-- Example tenant-scoped policy for a tenant-owned table:
-- ALTER TABLE "QualityCase" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "QualityCase" FORCE ROW LEVEL SECURITY;
-- CREATE POLICY quality_case_tenant_scope ON "QualityCase"
--   USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), ''))
--   WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), ''));

-- Runtime service transactions may use transaction-local variables:
-- SELECT set_config('app.current_tenant_id', '<verified tenant id>', true);
-- SELECT set_config('app.current_user_id', '<verified internal user id>', true);
-- Only trusted server code may select these values based on a verified session. A caller-set
-- arbitrary GUC is not authorization. Runtime DB role must be NOBYPASSRLS and least-privileged.

-- Membership enumeration before tenant selection and global User rows need separate user-self
-- policies or reviewed security-definer functions. Don't apply a tenant-only policy blindly to
-- global identity tables. Every tenant-owned child/link table must receive its own policy.

-- Release checklist:
-- 1. Confirm runtime role has rolbypassrls=false and is not a bypass-capable table owner.
-- 2. Enable + FORCE RLS for all tenant-owned tables, including join/link/outbox tables.
-- 3. Install USING/WITH CHECK policies for relevant CRUD operations.
-- 4. Install explicit self-membership/user-profile policy.
-- 5. Run isolation tests under actual pooled runtime connection; verify transaction-local scope resets.
-- 6. Keep migrations/backups on separate privileged credentials and test their workflow.
-- 7. Add DB grants/triggers preventing application role from editing/deleting AuditEvent rows.
