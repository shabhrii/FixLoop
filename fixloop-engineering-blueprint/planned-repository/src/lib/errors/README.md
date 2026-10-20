# Domain errors

`domain-error.ts` defines stable error codes (validation, unauthenticated, forbidden, not-visible/not-found, conflict, closure-blocked, rate-limited, provider-unavailable, internal). Handlers map to HTTP status and request ID. Client responses must not include SQL, stack traces, provider payloads, or tenant-existence clues.
