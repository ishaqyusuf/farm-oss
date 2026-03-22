# Farm OSS

Farm operations SaaS scaffold initialized from the structural approach used in `plot-keys`, adapted for a poultry-first farm management product.

## Apps
- `apps/api`: Hono API for farm operations and analytics
- `apps/dashboard`: authenticated operations dashboard
- `apps/expo`: Expo mobile app for farm operations on the go
- `apps/website`: marketing and landing site

## Packages
- `packages/auth`: auth helpers and shared auth types
- `packages/db`: database entry point and planned schema tooling
- `packages/tsconfig`: shared TypeScript configs
- `packages/ui`: shared UI package placeholder
- `packages/utils`: shared utilities

## Local Development
1. Install dependencies with `bun install`
2. Start all apps with `bun run dev`
3. Start one app with `bun run dev:website`, `bun run dev:dashboard`, `bun run dev:api`, or `bun run dev:expo`
4. Start Postgres with `bun run db:up`

## Notes
- This repository currently contains the initialized monorepo scaffold plus project brain docs.
- The next implementation focus should be the poultry domain model and daily record workflow.
