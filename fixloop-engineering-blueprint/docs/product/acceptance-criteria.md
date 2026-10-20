# MVP acceptance criteria

These are release tests, not claims that functionality exists yet.

## Intake
- Phone-sized browser can submit a case with description, site, category, measurement/unit, quantities and evidence.
- Unknown values remain null, not zero. Server assigns case number, tenant and reporter.
- Duplicate submit with the same idempotency key does not create a duplicate.
- Manual intake works if AI is disabled or unavailable.

## Investigation
- Quality Engineer can persist FACT, AI_HYPOTHESIS, TESTED and CONFIRMED findings.
- AI-originated finding cannot become CONFIRMED without explicit human confirmation.
- Confirmed findings store actor/time and evidence links or documented rationale.
- 5-Why steps persist in order, link evidence, and expose incomplete support.

## Actions/proof
- Quality Engineer assigns action type, owner, due date and description.
- Action Owner sees/updates assigned actions only and uploads completion proof.
- Required action cannot complete if policy requires proof and no finalized evidence exists.
- Case cannot enter verification while a required action is incomplete or unproven.

## Verification/closure
- Only a permitted human reviewer records the outcome.
- Failed or inconclusive check cannot close the case.
- Even an effective check is insufficient if another closure guard fails.
- Close/reopen events contain actor, timestamp, previous/new status, version and reason where required.

## Tenant/security
- Tenant A cannot read/mutate/search/upload to or sign a URL for tenant B resources by substituting IDs.
- Role/owner/status tampering in browser payload has no effect.
- Invalid/expired session fails closed; direct API calls are tested, not just UI hiding.

## Search/report/reliability
- Closed-case search is tenant-scoped and does not leak result counts from other tenants.
- PDF matches its persisted approved-value snapshot/version and checksum.
- Later case edits do not mutate previously exported PDF.
- Unaccepted AI hypotheses cannot render as confirmed causes.
- Clean migrations and upgrades pass; queue retries are idempotent; logs exclude secrets, signed URLs and raw uploaded content.
