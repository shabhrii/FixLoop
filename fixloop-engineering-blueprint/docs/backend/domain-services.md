# Backend domain-service contracts

Routes delegate to these services; services receive verified actor context and validated DTOs, never a caller-supplied role/authority.

- **CaseService:** `createDraft`, `submit`, `updateIntake`, `triage`, `transition`, `close`, `reopen`; checks site/tenant, allowed fields, transition policy, expected version, transaction and audit.
- **InvestigationService:** `addFinding`, `updateFinding`, `confirmFinding`, `saveWhySteps`; confirmation requires a human Quality Engineer, evidence or documented rationale and audit. Five-Why evidence must match tenant/case.
- **ActionService:** `createAction`, `updateAction`, `completeAction`; validates assignee membership/assignment, editable fields, completion note and proof policy.
- **VerificationService:** `recordEffectivenessCheck`; validates sample counts, criterion, reviewer role, evidence, case version and separation-of-duties policy. EFFECTIVE alone does not close.
- **EvidenceService:** `createUploadIntent`, `finalizeUpload`, `createDownloadUrl`, `archiveEvidence`; validates tenant/case/object association at every step.
- **AiSuggestionService:** `requestSuggestion`, `persistValidatedResult`, `decideSuggestion`; provider output is untrusted and human decision is separate.
- **ReportService:** `requestReport`, `buildApprovedSnapshot`, `renderPdf`, `finalizeReport`, `createDownloadUrl`; idempotent, private and checksum/version-bound.
- **SearchService:** `searchClosedCases`; allow-listed fields, tenant filter, query bound, pagination, safe DTO.

Shared requirements: typed errors; transaction/version guard for mutable aggregate; actor/request ID; critical audit writes within the same transaction; no raw evidence/secrets in logs.
