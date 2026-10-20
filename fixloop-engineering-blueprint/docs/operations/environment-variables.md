# Environment variables

The `.env.example` contains safe placeholders, not credentials.

| Variable | Purpose and rule |
|---|---|
| `NODE_ENV` | `development`, `test`, `production` |
| `APP_ORIGIN` | canonical origin for redirects/links; validate allowed origins |
| `DATABASE_URL` | least-privilege runtime PostgreSQL connection |
| `DIRECT_URL` | direct migration connection if pooler is unsuitable |
| `QUEUE_DATABASE_URL` | optional separate least-privilege queue connection |
| `NEXT_PUBLIC_SUPABASE_URL` | public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public anon key under correct policies; not authorization by itself |
| `SUPABASE_SERVICE_ROLE_KEY` | server only, highly privileged; never bundle into browser |
| `SUPABASE_STORAGE_BUCKET` | private bucket for evidence/reports |
| `AUTH_COOKIE_SECRET` | only if selected auth setup requires app-level secret; generate high entropy |
| `AI_ENABLED` | default false locally |
| `AI_PROVIDER` | default `mock`; production provider only after privacy review |
| `AI_MODEL` | configured model ID; record used model per suggestion |
| `AI_API_KEY` | server-side provider secret only |
| `AI_TIMEOUT_MS` | bounded provider deadline (proposed 12000 ms default) |
| `UPLOAD_MAX_BYTES` | proposed 15728640 bytes; must align with host limits |
| `SIGNED_URL_TTL_SECONDS` | proposed 300 seconds; short-lived URLs |
| `CRON_SECRET` | secret for optional job dispatcher endpoint |
| `LOG_LEVEL` | log threshold; redaction applies at all levels |
| `SENTRY_DSN` | optional monitoring; configure privacy scrubbing |

Validate server configuration at boot with Zod and fail fast without printing secret values. Only intentionally public values may use `NEXT_PUBLIC_`.
