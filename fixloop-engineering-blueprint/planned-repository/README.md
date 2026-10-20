# Planned application repository map

This directory contains **specification-only README files** placed at intended application paths. The implementation targets themselves are not present here. Use `../FILE_TREE.md` as the canonical target tree and `../docs/file-specs/file-responsibility-matrix.md` for per-file invariants.

## Global rule

All trust decisions happen server-side. API handlers parse and authorize; services enforce domain invariants; policies are pure; repositories/Prisma enforce relational integrity; background jobs are idempotent. The UI may improve usability but cannot grant permission or declare closure.

## Implementation skeleton

Create root configuration and actual source files using the listed READMEs as module contracts. Implement vertical slices, beginning with identity/tenant isolation and case draft/submission, and only then adding evidence, investigation, actions, verification, AI, reporting and search.
