# Product requirements document

## Goal

Make defect reporting fast and make it difficult to close a case without evidence that the corrective action worked.

## Actors

- **Operator/Inspector:** report defect with site, description, part/machine context, reading/unit, quantities and optional evidence.
- **Quality Engineer:** triage, investigate, manage findings/5-Why, assign actions, review effectiveness, close/reopen and export reports.
- **Action Owner:** view assigned actions, update progress and upload completion proof.
- **Tenant Admin:** manage workspace members, roles and sites. Admin permission does not automatically make someone a quality approver.
- **Auditor/Viewer:** read authorized case/actions/verification/audit data without mutation.
- **Worker:** process queued suggestions/reports; cannot make quality decisions.

## Functional requirements

### FR-01 Tenant workspace
A user may access only tenants where they have an active membership. A tenant can contain multiple sites. Every business object is tenant-scoped; a case's site must belong to the same tenant.

### FR-02 Intake
Create a draft/submitted case with site, title/description, category if known, severity, part number, machine/work cell, measurement + unit, specification, quantity inspected and affected, and evidence. Unknown values remain null, not zero. Server assigns reporter and case identifier/number.

### FR-03 Evidence
Persist uploader, tenant/case, object key, media type, size, optional checksum, evidence type/caption, timestamp and optional finding/action links. Store bytes privately; authorize every download. Only finalized evidence can count as proof.

### FR-04 AI drafting
AI may suggest title/category/neutral summary/investigation questions and possible causes. Output must pass strict schema validation, visibly remain a suggestion, and support accept/edit/reject. Human-approved values are stored separately. Core intake works if AI is down or disabled.

### FR-05 Findings
Quality Engineer can create FACT, AI_HYPOTHESIS, TESTED and CONFIRMED findings. CONFIRMED requires a human actor and evidence reference or documented reason why evidence cannot be attached. AI cannot confirm.

### FR-06 5-Why
Persist ordered steps with question, answer and optional supporting evidence. Allow an incomplete draft, show incomplete support, and do not force a causal chain when evidence is insufficient.

### FR-07 Actions
Every action has type (containment/corrective/preventive), description, owner, due date, status, creator, completion note and proof evidence. Required actions must be complete and proof-backed before verification; a policy-controlled waiver, if allowed, must be reasoned and audited.

### FR-08 Effectiveness review
Reviewer records criterion, sample plan/window, sample size, out-of-tolerance count, evidence, comments and human outcome `EFFECTIVE`, `NOT_EFFECTIVE` or `INCONCLUSIVE`. Numeric measurements inform but do not replace the human decision. Non-effective/inconclusive results cannot close a case.

### FR-09 Closure/reopen
Only Quality Engineer capability may close. Require completed required actions, proof or audited waiver, latest applicable effective review, required confirmed findings per policy and fresh version. Reopen requires reason. State change + audit event commit atomically.

### FR-10 Closed-case library
Search closed cases by case number, title, category, part, machine, confirmed cause and action text. Scope query and results to the caller's tenant/permission; do not leak object keys or counts from other tenants.

### FR-11 PDF report
Create a server-generated PDF from persisted human-approved values. Tie it to a case version/snapshot and checksum. Unaccepted AI hypotheses must not appear as confirmed conclusions.

### FR-12 Audit
Append events for create/edit/submit, evidence finalized, AI suggestion request/decision, finding confirmation, assignment, action completion, effectiveness decision, close/reopen, permission change, export and sensitive download where appropriate. No secrets or raw file bytes in logs/audit metadata.

## Non-functional requirements

- HTTPS, secure sessions, server-side authorization, tenant isolation, private evidence, rate limits and secrets outside source control.
- Atomic critical decisions + audit; version guard against lost updates; decimal measurements stored as NUMERIC.
- AI outage never blocks manual intake/workflow.
- Important decisions retain actor/time/evidence provenance.
- Responsive phone-first interface with loading/error/empty/denied/stale states; status not indicated by color alone.
- Provider disclosed, minimal fields sent; no customer-content training by default unless separately consented/contracted and verified.
- Typed contracts, reproducible migrations, automated tests, redacted logs, backup/restore runbook.

## Metrics to measure in pilots, not pre-claim

Time from draft to submission; evidence completeness at triage; submission-to-owner time; action completion with proof; first-pass effectiveness rate; reopen/recurrence rate; time per case before/after; AI accept/edit/reject and harmful suggestion rate. Establish baselines during discovery; the deck provides no measured baseline.
