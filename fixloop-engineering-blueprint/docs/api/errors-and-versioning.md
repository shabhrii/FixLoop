# API errors and versioning

## Standard error shape

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "requestId": "req_example",
    "details": [{"field": "quantityAffected", "rule": "must_not_exceed_quantityInspected"}]
  }
}
```

Never include secrets, another tenant's metadata, complete AI provider payloads or stack traces in client errors.

## HTTP mapping

- 400 `BAD_REQUEST`: malformed command or invalid request shape.
- 401 `UNAUTHENTICATED`: missing/invalid/expired session.
- 403 `FORBIDDEN`: member lacks capability; use 404 for cross-tenant object access to reduce enumeration.
- 404 `NOT_FOUND`: absent or intentionally concealed object.
- 409 `VERSION_CONFLICT` / `INVALID_TRANSITION`: stale aggregate or illegal transition.
- 413 `PAYLOAD_TOO_LARGE`; 415 `UNSUPPORTED_MEDIA_TYPE`.
- 422 `VALIDATION_FAILED`: field/business invariant fails.
- 429 `RATE_LIMITED`: rate/usage cap reached.
- 502 `AI_PROVIDER_FAILED`; 503 `SERVICE_UNAVAILABLE`: dependency failure; case intake remains usable when AI is unavailable.
- 500 `INTERNAL_ERROR`: generic message and request ID only.

## Versioning

API prefix `/api/v1`. Breaking changes require a coordinated migration or new version. Mutable case DTOs include `version`; mutation uses `If-Match` or `expectedVersion`. Keep OpenAPI, Zod schemas and UI DTOs synchronized.
