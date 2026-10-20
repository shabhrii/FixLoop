# `src/lib/` — shared infrastructure and typed adapters

Cross-cutting low-level modules: database client, auth context, validation schemas, typed error mapping, private object storage, AI provider adapter, queue, audit writer and PDF renderer. Keep domain use cases in `src/server/services`. Side-effecting adapters must have explicit input/output contracts and normalized errors. No module may log secrets, raw evidence or unnecessary prompt content.
