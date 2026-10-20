# Implementation file checklist

This checklist complements `file-responsibility-matrix.md`. The repository tree in `FILE_TREE.md` is the canonical planned path listing. Do not treat a file as implemented merely because it has a specification here.

## Root configuration files to create

| Path | Contract |
|---|---|
| `package.json` | Pin runtime scripts and dependencies; scripts include `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`. |
| `pnpm-lock.yaml` | Reproducible dependency graph; CI uses frozen lockfile. |
| `next.config.ts` | Security headers/image policy/typed routes as supported by pinned Next.js version; no secrets. |
| `tsconfig.json` | `strict: true`, no implicit any, aliases limited to a clear source root. |
| `eslint.config.mjs` | TypeScript/React/Next lint, prohibit secret logging and unsafe patterns where lint rules support it. |
| `postcss.config.mjs` | Tailwind/PostCSS integration for pinned stack. |
| `middleware.ts` | Optional early request redirect only; never sole authorization boundary. |
| `.gitignore` | Ignore env secrets, build outputs, local database data, test reports, uploaded evidence and private keys. |
| `.github/workflows/ci.yml` | Install from lockfile, lint, typecheck, unit tests, Prisma validation, integration tests, build. Do not deploy on untrusted PRs with secrets. |

## Application bootstrap

| Path | Contract |
|---|---|
| `src/app/layout.tsx` | Root shell, metadata and providers; keep server components default. |
| `src/app/page.tsx` | Public landing or safe redirect; allow-list callback destinations. |
| `src/app/globals.css` | Design tokens, responsive defaults, high-contrast focus states and reduced-motion support. |
| `src/app/(auth)/login/page.tsx` | Accessible sign-in form and generic auth failures. |
| `src/app/(workspace)/app/layout.tsx` | Verify session and tenant membership server-side before private render. |
| `src/app/(workspace)/app/page.tsx` | Summary view; aggregate queries must scope tenant and site. |

## API handlers listed in `FILE_TREE.md`

Each `route.ts` must: parse path and body; establish the trusted actor from verified auth; establish tenant membership; authorize capability and object; validate version/state; call a service (not contain business logic inline); return a safe DTO; map typed domain errors; add request ID; and audit sensitive commands in the same database transaction as the mutation. Read handlers must paginate and select only approved fields.

## Forms/components listed in `FILE_TREE.md`

Every component should specify its props and UI states (`loading`, `empty`, `invalid`, `error`, `success`, `readOnly`). Client-side validation is for usability only. A disabled button is not authorization. Uploaded files stay pending until server finalize verifies object metadata. Evidence must have human-readable captions/metadata and an explicit link to the claim it supports.

## Services and policy

Services are the application use-case layer. They receive a trusted actor/tenant context, use transaction boundaries for mutations, call pure policies for transitions/closure readiness, validate object relationships and append audit events. Policy functions are deterministic and side-effect free. Do not call the LLM within a database transaction; enqueue work and process asynchronously.

## Jobs

Job handlers assume at-least-once delivery. They must deduplicate by stable `jobKey`, persist status, use bounded retries/backoff, record a sanitized failure code, and be safe after worker restart. A job's existence or completion cannot bypass human review.

## Tests

- Unit: policy transitions, schema parsing, validators, normalization.
- Integration: transaction/unique constraints, tenant isolation, RLS using actual deployment DB role, storage authorization and job redelivery.
- E2E: operator report → engineer investigation → owner proof → reviewer effectiveness → close → search/PDF.
- Security regression: direct ID swapping across tenants, role escalation, expired URL, upload spoofing, object-key tampering and overbroad search.
