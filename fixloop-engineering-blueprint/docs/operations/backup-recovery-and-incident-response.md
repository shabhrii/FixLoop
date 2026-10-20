# Backup, recovery and incident response

A database backup is not a full product backup: separately define durability/versioning/recovery for evidence and report objects. Use point-in-time recovery or documented snapshot frequency based on the chosen provider and customer tolerance.

## Recovery outline
1. Declare incident and identify impacted tenants.
2. Stop destructive writes/workers if integrity is uncertain; preserve audit/log evidence.
3. Restore DB and objects to a recovery environment using compatible points in time.
4. Verify referential integrity, representative evidence/report checksums and orphan uploads.
5. Run auth/tenant/workflow smoke tests before traffic returns.
6. Record recovery point/time, lost/replayed jobs and customer communications.

## Incident classes
Cross-tenant exposure/signed URL leak; leaked credential; evidence corruption/loss; software defect allowing invalid closure; AI provider breach/unsafe output; major queue/availability incident.

## Response rules
Rotate/revoke secrets/capabilities, preserve forensic audit trail, determine affected tenants and artifacts. If a case incorrectly closed because of a defect, don't silently rewrite history—record corrective event and reopen through an audited process. Follow contract/applicable law for notification and retention; this blueprint does not decide legal obligations.

Before pilot name owners for backups, escalation, support-provider liaison, customer communication and restoration approval; rehearse restore rather than assuming backups work.
