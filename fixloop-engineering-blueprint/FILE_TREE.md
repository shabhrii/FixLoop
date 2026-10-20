# Intended FixLoop source repository — annotated tree

This is the **target application repository**, not a statement that all source files already exist. The archive contains the docs/contracts/draft schema and directory READMEs under `planned-repository/`; the app `.ts/.tsx` files are implementation targets, not supplied running code.

```text
fixloop/
├── AGENTS.md, README.md, .env.example, .gitignore
├── package.json, pnpm-lock.yaml, next.config.ts, tsconfig.json
├── eslint.config.mjs, postcss.config.mjs, middleware.ts
├── public/manifest.json, public/icons/{icon-192.png,icon-512.png}
├── contracts/{openapi.yaml,ai-suggestion.schema.json}
├── prisma/{schema.prisma,rls.sql,seed.ts,migrations/<timestamp>_<name>/migration.sql}
├── src/
│   ├── app/{layout.tsx,page.tsx,globals.css}
│   ├── app/(auth)/login/page.tsx
│   ├── app/(workspace)/app/{layout.tsx,page.tsx,cases/page.tsx,cases/new/page.tsx,cases/[caseId]/page.tsx,actions/page.tsx,library/page.tsx,admin/sites/page.tsx,admin/members/page.tsx}
│   ├── app/api/v1/{healthz/route.ts,me/route.ts}
│   ├── app/api/v1/tenants/[tenantId]/sites/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/{submit,triage,close,reopen,timeline}/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/evidence/upload-intents/route.ts
│   ├── app/api/v1/tenants/[tenantId]/evidence/[evidenceId]/{finalize,download}/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/findings/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/findings/[findingId]/confirm/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/investigation/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/investigation/why-steps/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/actions/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/actions/[actionId]/complete/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/effectiveness-checks/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/ai-suggestions/route.ts
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/ai-suggestions/[suggestionId]/{route.ts,decision/route.ts}
│   ├── app/api/v1/tenants/[tenantId]/cases/[caseId]/reports/route.ts
│   ├── app/api/v1/tenants/[tenantId]/reports/[reportId]/route.ts
│   ├── app/api/v1/tenants/[tenantId]/closed-cases/search/route.ts
│   ├── components/layout/{workspace-shell,mobile-nav}.tsx
│   ├── components/cases/{case-intake-form,evidence-uploader,case-status-badge,finding-editor,five-why-editor,ai-suggestion-panel,audit-timeline}.tsx
│   ├── components/actions/{action-editor,action-card}.tsx
│   ├── components/verification/{effectiveness-form,close-case-dialog}.tsx
│   ├── components/reports/report-export-button.tsx
│   ├── lib/db/prisma.ts
│   ├── lib/auth/{session,tenant-context,policy}.ts
│   ├── lib/validation/{env,case,evidence,ai}.ts
│   ├── lib/errors/domain-error.ts, lib/storage/private-storage.ts
│   ├── lib/ai/{adapter,mock-provider,schemas}.ts
│   ├── lib/queue/client.ts, lib/audit/write-audit-event.ts
│   ├── lib/reports/render-case-pdf.tsx
│   ├── server/policies/case-policy.ts
│   ├── server/services/{case,investigation,action,verification,evidence,ai-suggestion,report,search}-service.ts
│   ├── server/jobs/{worker,handle-ai-suggestion,handle-report,dispatch-outbox}.ts
│   └── types/{api,auth,domain}.ts
└── tests/
    ├── unit/{case-policy,ai-schema,validation}.test.ts
    ├── integration/{tenant-isolation,closure-transaction,evidence-storage,job-idempotency}.test.ts
    ├── e2e/{fixloop-happy-path,tenant-isolation}.spec.ts
    └── fixtures/{demo-case,ai-responses}.json
```

## What belongs where

- `src/app`: route rendering and HTTP boundary only. No inline lifecycle logic.
- `src/components`: UI/form pieces; no security authority or server secrets.
- `src/lib`: cross-cutting infrastructure and adapters.
- `src/server/services`: business commands, transactions, lifecycle rules; `policies` stays deterministic/pure.
- `src/server/jobs`: background handlers with at-least-once/idempotent semantics.
- `contracts`: external/API and model-output schemas.
- `prisma`: canonical schema, reproducible migrations, RLS and synthetic seed.
- `tests`: unit, real DB/security/storage integration and full E2E.


## Directory spec index

The `planned-repository/` tree contains a `README.md` in every major and fine-grained target directory. Those READMEs define boundaries for routes, components, auth, validation, storage, AI, jobs, services, Prisma, contracts and test layers. The `docs/markdown-inventory.md` gives a complete Markdown navigation index. The source file contracts are expanded in `docs/file-specs/file-responsibility-matrix.md` and `docs/file-specs/implementation-file-checklist.md`.
