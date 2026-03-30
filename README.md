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
2. Create a local env file with `cp .env.example .env`
3. Start Postgres with `bun run db:up`
4. Run database migrations with `bun run db:migrate`
5. Optionally seed demo data with `bun run db:seed`
6. Start all apps with `bun run dev`
7. Start one app with `bun run dev:website`, `bun run dev:dashboard`, `bun run dev:api`, or `bun run dev:expo`

## Docker Postgres
- Container: `farm-oss-postgres`
- Image: `postgres:16-alpine`
- Host port: `5433`
- Database: `farm_oss`
- Username: `postgres`
- Password: `postgres`
- Connection URL: `postgres://postgres:postgres@localhost:5433/farm_oss`

Helpful commands:
- `bun run db:up` to start Postgres
- `bun run db:logs` to follow database logs
- `bun run db:down` to stop the container
- `bun run db:studio` to open Prisma Studio

## Notes
- This repository currently contains the initialized monorepo scaffold plus project brain docs.
- The next implementation focus should be the poultry domain model and daily record workflow.
