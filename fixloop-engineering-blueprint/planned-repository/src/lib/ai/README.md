# AI provider adapter and schema boundary

- `adapter.ts`: provider-neutral interface, explicit timeouts, token/data minimization, request correlation and normalized failure classes.
- `mock-provider.ts`: deterministic offline implementation for local/test; make mock mode visible in UI/log metadata.
- `schemas.ts`: runtime parser and schema version check for outputs.

AI inputs are a minimal, permission-checked summary and selected evidence metadata/text—not all tenant records by default. Prompt text and retrieved evidence are untrusted data. Provider output is never executable instruction, fact confirmation or lifecycle authority.
