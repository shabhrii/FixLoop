# Data flows and trust boundaries

## Report a defect
1. Browser obtains a verified session and user selects an authorized site.
2. API validates body and creates case, assigning tenant/reporter server-side.
3. Evidence upload-intent endpoint checks case scope/type/size and returns a signed URL for a server-generated object key.
4. Browser uploads directly to private storage.
5. Finalize endpoint checks object existence, size/type and optional checksum; only then stores `AVAILABLE` evidence metadata and audit event.
6. Optional suggestion job contains only allowed fields; case exists regardless of AI outcome.

## Investigate and confirm
1. Quality Engineer opens a tenant-scoped case.
2. Engineer records findings and evidence links; AI hypotheses are visually distinct.
3. `confirmFinding` checks role and evidence or documented rationale, stores human actor/time and appends audit in one transaction.
4. 5-Why statements remain human-authored; AI can suggest questions but never fills facts as if observed.

## Action and proof
1. Quality Engineer creates an action with owner, type and due date.
2. Action Owner's identity/assignment is checked on every change.
3. Completion command requires note and available proof according to policy.
4. Case cannot proceed while any required action lacks completion/proof.

## Verification and close
1. Reviewer enters criterion, sample/window, measurement data and explicit outcome.
2. Invalid/inconclusive outcome keeps case open; ineffective outcome routes back to corrective work.
3. Effective outcome triggers `canClose`; all guards and version checks must pass.
4. Status/close metadata/audit event are written atomically.
5. PDF uses an approved snapshot of that case version and is stored privately with checksum.

## AI suggestion
1. Server constructs allow-listed minimal payload; no auth tokens, other-tenant data or raw evidence by default.
2. Provider gets untrusted notes explicitly wrapped as data, with timeout/output limits and disclosure.
3. Response is parsed and schema-validated. Invalid output is rejected, not partly trusted.
4. Original proposal + model/prompt/schema/input-hash metadata are retained; don't store unnecessary raw prompts.
5. Human accept/edit/reject is separate and audited; confirmed cause and case status are never set by model output.

## Trust boundaries
Browser/API input is untrusted; DB access relies on scoped service calls plus RLS; object storage uses private keys and signed capabilities; the AI provider is an external data-processing boundary; worker payload is a locator rather than canonical state; a PDF is a derived immutable artifact, not the source of truth.
