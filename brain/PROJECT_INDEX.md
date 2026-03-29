# Project Index

## Purpose
This file tracks the repository structure so contributors can quickly understand where code and documentation live.

## How To Use
- Update when new apps, packages, services, or major modules are added.
- Keep sections aligned to the real repository layout.
- Note empty or planned areas clearly.

## Current Repository State
- Repository now contains a Bun + Turbo monorepo scaffold plus the project brain.

## Top-Level Areas
- `apps/`: application entry points.
- `packages/`: shared libraries and configuration.
- `brain/`: project knowledge base.
- Root config: workspace, lint, TypeScript, and local database setup.

## Apps
- `apps/api`: Hono API with database-backed REST and tRPC endpoints for all domain entities. Domain routers in `src/trpc/routers/domain/`. Routers: farm, farmMember, flockBatch, dailyRecord, cageUnit, cageProduction, pondBatch, pondRecord, expense, sale. tRPC procedure tiers: publicProcedure, protectedProcedure, managerProcedure, ownerProcedure. `assertFarmAccess()` helper for farm-scoped access.
- `apps/dashboard`: Next.js dashboard using a `src/app` structure.
- `apps/desktop`: Tauri desktop shell for the dashboard.
- `apps/expo`: Expo Router mobile app with 5-tab layout (Home, Record, Expenses, Sales, History). Uses NativeWind v4 (Tailwind CSS) for styling with custom color tokens in `tailwind.config.js`. Reusable UI components in `src/components/ui/`. tRPC-wired daily record/expense/sale forms, dashboard with `dailyRecord.summary` metrics and active batch display, and lightweight auth state.
- `apps/website`: Next.js marketing site using a `src/app` structure.

## Packages
- `packages/auth`: shared role and auth primitives. FarmRole (`owner` | `manager` | `worker`), FarmMemberRole, FarmType, ROLE_HIERARCHY, hasRole helpers, hasTenantWideFarmAccess.
- `packages/db`: Prisma ORM with PostgreSQL schema for all domain entities (Tenant, User, FarmMember, Farm, FlockBatch, CageUnit, CageProduction, DailyRecord, PondBatch, PondRecord, Expense, Sale, Alert). Exports singleton PrismaClient. Includes seed script for development data.
- `packages/tsconfig`: shared TypeScript configuration presets.
- `packages/ui`: shared UI package placeholder and PostCSS config.
- `packages/utils`: shared utilities.

## Notes
- The structure is intentionally lighter than `plot-keys` and tuned for a farm operations SaaS starting with poultry workflows.
