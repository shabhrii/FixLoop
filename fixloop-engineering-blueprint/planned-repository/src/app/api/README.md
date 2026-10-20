# `src/app/api/` — HTTP interface

Each handler is a thin boundary: validate route params and payload with Zod, derive identity from verified auth, derive tenant scope from membership rather than trusting request fields, run a centralized capability/object check, call the domain service, and map typed errors to stable JSON. All successful mutations return canonical server state and version. Use request IDs, strict body limits, rate limits and audit events where applicable.
