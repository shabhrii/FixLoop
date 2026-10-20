# Authorization implementation checklist

- [ ] Every protected route requires verified session.
- [ ] Every tenant operation resolves active membership server-side.
- [ ] Capability definitions live in one policy module, not scattered route conditions.
- [ ] Every child read/write is tenant-scoped and parent/case consistency verified.
- [ ] Action-owner mutations enforce assignment.
- [ ] PATCH schemas exclude privileged fields.
- [ ] Case transitions use explicit server commands.
- [ ] RLS tests run as a non-owner/no-BYPASSRLS runtime DB role.
- [ ] Search, signed URL and report endpoints are in cross-tenant tests.
- [ ] Role changes are audited and permissions re-evaluated on each request.
- [ ] Critical case decision writes are atomic with audit append.
