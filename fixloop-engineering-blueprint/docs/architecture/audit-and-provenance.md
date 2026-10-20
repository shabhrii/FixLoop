# Audit and provenance

Audit exists to reconstruct who did what, to which quality record, when and why. It is not merely debug logging.

## Event fields
Unique ID, tenant, actor type/ID, event name, entity type/ID, server UTC timestamp, case/version when relevant, minimal before/after diff or typed metadata, reason for reopen/cancel/waiver/reversal, request/correlation ID and job ID where relevant. Avoid large full-row snapshots and never include credentials, tokens, signed URLs or binary bytes.

## Atomicity
Closure, reopening, confirmation, effectiveness decision and role change must write the business mutation and audit event in the same transaction; if audit insertion fails, rollback. Storage and job events span external systems, so audit their initiation and finalization separately.

## AI provenance
Store provider/model, prompt/schema version, suggestion type, request time, input hash/allowed field list, result status and human decision. Keep original model output separate from any human-edited values. Avoid retaining full raw prompts by default.

## UI
Show human-readable case timeline with actor/time, filtered by permission. Persist UTC and format for site timezone in the UI.
