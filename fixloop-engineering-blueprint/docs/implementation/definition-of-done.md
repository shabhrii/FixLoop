# Definition of done

- [ ] Behavior matches PRD and planned/implemented status is described honestly.
- [ ] Request/response schemas validated and API contract updated.
- [ ] Server session, active membership, capability and object scope enforced.
- [ ] Tenant isolation/RLS effects addressed.
- [ ] Transactions/version guard used where required.
- [ ] Critical action writes audit events atomically.
- [ ] UI handles loading, validation, empty, denied, failure and stale-version states.
- [ ] No secrets/raw customer content leak to logs.
- [ ] Unit/integration/E2E tests include positive and negative cases.
- [ ] Env vars documented/startup-validated; migrations tested clean and upgrade.
- [ ] Directory/file spec updated.
- [ ] Optional provider can be disabled without breaking core workflow.
