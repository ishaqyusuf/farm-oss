# ADR-004: Prisma as ORM

## Status
- Accepted

## Context
- The poultry domain model is defined with 8 entities (Tenant, User, Farm, FlockBatch, DailyRecord, Expense, Sale, Alert).
- The project needs an ORM to define the database schema, generate migrations, and provide a type-safe client for application code.
- The two main candidates were Drizzle and Prisma. Both had placeholder config files in `packages/db`.

## Decision
- Use Prisma (v7) as the ORM for the farm-oss project.
- Schema defined in `packages/db/prisma/schema.prisma`.
- Database URL configured in `packages/db/prisma.config.ts` (Prisma 7 pattern).
- Generated client output to `packages/db/generated/prisma` (gitignored).
- Singleton PrismaClient exported from `packages/db/src/index.ts`.

## Rationale
- Prisma provides a declarative schema language that maps directly to the domain model documentation.
- Type-safe generated client reduces runtime errors and improves developer experience across the monorepo.
- Built-in migration workflow (`prisma migrate dev` / `prisma migrate deploy`) fits the project's PostgreSQL setup.
- Prisma Studio provides a visual database browser useful during early development.
- Wide ecosystem support and documentation for PostgreSQL, multi-tenant patterns, and monorepo setups.

## Consequences
- All database schema changes go through `prisma/schema.prisma` and the migration workflow.
- `packages/db/generated/` must be regenerated after schema changes (`bun run db:generate`).
- The generated client is gitignored; CI and local dev must run `prisma generate` after install.
- Drizzle config removed from the project.

## Alternatives Considered
- **Drizzle ORM**: More SQL-like, lighter runtime, but less mature migration tooling and less built-in schema visualization. Could revisit if Prisma's overhead becomes a concern.
- **Raw SQL / no ORM**: Maximum control but sacrifices type safety and developer velocity at this stage.
