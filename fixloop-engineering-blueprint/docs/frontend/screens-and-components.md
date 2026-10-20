# Frontend screens and components

## Screen map
- `/login`: sign-in form; generic failures to avoid account enumeration.
- `/app`: tenant-aware dashboard with open cases/overdue actions/recent records, all based on tenant-scoped data.
- `/app/cases`: paginated filters and mobile card list/desktop table.
- `/app/cases/new`: intake form with site, description, measurements/spec, part/machine, counts and evidence.
- `/app/cases/[caseId]`: summary/status, evidence, findings/5-Why, actions, verification, PDF and permitted timeline.
- `/app/actions`: assigned-action queue and proof upload.
- `/app/library`: closed-case search and filters.
- `/app/admin/members`, `/app/admin/sites`: tenant admin settings.

## Component contracts
- `CaseIntakeForm`: validates user-editable fields only; no authority over tenant/reporter/status.
- `EvidenceUploader`: upload-intent → upload → finalize; states: pending, uploading, failed, available. Only finalized evidence counts.
- `AISuggestionPanel`: visibly unverified result with accept/edit/reject.
- `FindingEditor`: finding kind/statement/support; confirmation is a separate explicit command, not a normal dropdown patch.
- `FiveWhyEditor`: ordered steps and evidence links; incomplete drafts remain possible.
- `ActionEditor` / `ActionCard`: action type, owner, due date, status and proof.
- `EffectivenessForm`: criterion, sampling window/counts, evidence and explicit human outcome; no default to EFFECTIVE.
- `CloseCaseDialog`: invokes the close endpoint and renders blocking reasons from server.
- `AuditTimeline`: read-only and permission-filtered.
- `ReportExportButton`: requests job, polls state and downloads only an authorized completed artifact.

All forms need loading, validation, network failure, empty, forbidden and stale-version states. Do not show success optimistically before the server confirms. Use accessible labels and status text as well as colors.
