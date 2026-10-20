# Versioned contracts

`openapi.yaml` defines the public REST surface and stable errors; `ai-suggestion.schema.json` constrains model output. Validate these in CI and ensure code/schema versions do not drift. OpenAPI must grow to cover every implemented endpoint before external consumers depend on it. JSON Schema validation does not imply factual correctness or provide authorization.
