# Queue adapter

Publish versioned job payloads containing stable IDs and tenant/case IDs, not confidential blobs. Use durable outbox writes in the same transaction as state changes that require downstream work. Consumers deduplicate by `jobKey`, apply bounded retries/backoff and write terminal status. Jobs must reload and re-authorize referenced records from the database, because queued payloads may be stale or forged in tests.
