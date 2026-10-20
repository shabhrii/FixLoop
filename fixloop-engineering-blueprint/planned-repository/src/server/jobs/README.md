# Background job handlers

`worker.ts` registers versioned jobs. `handle-ai-suggestion.ts` reloads the authorized case context, minimizes provider input, validates the entire model response, persists untrusted suggestions and logs normalized status. `handle-report.ts` renders an approved snapshot, uploads privately and stores checksum/status. `dispatch-outbox.ts` sends durable outbox events to the queue. Handlers must be idempotent, observable, bounded in retries and safe after partial failure.
