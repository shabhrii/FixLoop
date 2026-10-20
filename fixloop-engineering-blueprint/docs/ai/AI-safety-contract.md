# AI safety contract

## Allowed MVP tasks
- Suggest short title, category from controlled list, neutral summary and questions that help an engineer gather evidence.
- Propose possible causes only as `AI_HYPOTHESIS` and state what evidence would test them.

## Forbidden
AI must not mark a cause `CONFIRMED`, invent measurements/quantities/equipment logs/proof, mark an action complete, determine effectiveness, close/reopen a case, approve release, certify compliance or control machines. It must not use another tenant's data or follow instructions embedded in notes/OCR/filenames that conflict with system rules.

## Pipeline
1. Authorize a request and build an allow-listed, minimal input payload.
2. Avoid names/personal data and raw evidence by default. OCR is a separate future data-use decision.
3. Treat notes/files as untrusted data; ask for schema-only output and no invented facts.
4. Apply provider timeout, output-token limits, rate controls and cancellation.
5. Parse, validate JSON Schema + matching runtime Zod; malformed output is rejected, not partially accepted.
6. Store provider/model, prompt/schema versions, input hash, status and decision, not unnecessary raw prompt.
7. Display as `AI suggestion — not verified` with Accept/Edit/Reject.
8. Persist the human-selected value separately; all accepted/edited content is still subject to human authority.

## Provider/privacy
Before production, document fields sent, region, retention, subprocessors, deletion and contractual/account-level no-training terms. A prompt cannot guarantee provider training policy. Disclose provider and allow AI to be disabled. Manual workflow must continue when disabled.

## Monitoring
Track acceptance, edit, rejection, invalid output and harmful/invented-content reports. Acceptance rate alone is not quality. Use synthetic + approved/de-identified pilot evaluation. Roll back unsafe prompt/provider versions.
