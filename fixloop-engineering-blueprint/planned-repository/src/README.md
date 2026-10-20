# `src/` — application boundary

Contains Next.js route rendering, HTTP handlers, reusable UI, infrastructure adapters, typed domain contracts and server use cases.

**Dependency direction:** `app` → `server/services` and `lib` → database/provider adapters. UI code cannot import server-only secrets or worker internals. Keep lifecycle logic out of React components and route handlers. Mark server-only modules where supported; run lint rules against accidental client imports.
