# Shared type definitions

`api.ts` contains response/request DTOs and stable error shape; `auth.ts` contains trusted session/membership context (never browser-asserted role claims); `domain.ts` contains enums and domain data contracts aligned with database schema. Prefer schema inference from runtime validators where possible; avoid duplicating incompatible enum strings across UI, API, DB and AI schemas.
