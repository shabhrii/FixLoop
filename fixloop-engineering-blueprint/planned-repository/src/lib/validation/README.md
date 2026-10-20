# Input and environment validation

Zod schemas form the HTTP/service input boundary for case fields, measurement/quantity constraints, evidence metadata, pagination, AI outputs and environment configuration. Normalize at one boundary; reject unknown keys on sensitive commands. Treat validation as shape/sanity, not authorization. Avoid including raw values/secrets in parse errors returned to clients.
