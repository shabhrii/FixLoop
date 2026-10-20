# Audit writer

Append actor, tenant, object type/ID, action, timestamp, request/correlation ID, prior/new versions and sanitized metadata. Never store passwords, tokens, signed URLs or raw evidence. Mutation and required audit event commit atomically. Do not provide application endpoints for arbitrary event modification/deletion; append-only guarantees also require database-role controls and retention design.
