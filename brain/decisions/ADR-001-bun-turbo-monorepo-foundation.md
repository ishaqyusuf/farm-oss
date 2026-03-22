# ADR-001: Bun Turbo Monorepo Foundation

## Status
- Accepted

## Context
- The project needed an initial application structure that supports multiple apps, shared packages, and fast iteration.
- The `plot-keys` repository already provides a proven local reference for a Bun + Turbo workspace shape.
- The product needs room for an API, an authenticated dashboard, and a public website from the start.

## Decision
- Initialize `farm-oss` as a Bun + Turbo monorepo with:
- `apps/api`
- `apps/dashboard`
- `apps/website`
- `packages/auth`
- `packages/db`
- `packages/tsconfig`
- `packages/ui`
- `packages/utils`

## Consequences
- Shared code and configuration have clear workspace homes.
- The project can evolve toward multi-app SaaS architecture without an early restructure.
- The initial scaffold remains lightweight and does not force full feature parity with `plot-keys`.

## Alternatives Considered
- Single Next.js app only
- Web app first with no API workspace
- Copying the full `plot-keys` package surface without reducing it for farm-specific needs

