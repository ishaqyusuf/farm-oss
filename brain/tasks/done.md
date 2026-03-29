# Done

## Purpose
This file tracks completed work items with enough context to understand progress.

## How To Use
- Move completed work here with a short note.
- Keep entries concise and dated when useful.
- Reference ADRs or feature docs when relevant.

## Done
- 2026-03-21: Initialized Project Brain documentation system and seeded the repository with starter product, system, API, database, engineering, and task docs.
- 2026-03-22: Initialized the repository from a PlotKeys-style Bun + Turbo monorepo foundation with API, dashboard, website, shared packages, and base config.
- 2026-03-22: Added a Midday-inspired Tauri desktop shell under `apps/desktop` with environment-based targets for development, staging, and production.
- 2026-03-22: Added a GND-inspired Expo Router mobile app scaffold under `apps/expo` for poultry-first daily operations.
- 2026-03-22: Replaced the placeholder API with a GND-inspired Hono foundation including REST routes, Bun runtime entry, and a starter tRPC router.
- 2026-03-22: Wired Expo to auth and tRPC, and standardized dashboard, Expo, and website around a `src` folder structure.
- 2026-03-22: Modeled core poultry domain entities in `brain/database/schema.md` with full field specs, conventions, relationships, and indexes.
- 2026-03-22: Chose Prisma (v7) as ORM (ADR-004). Implemented schema in `packages/db/prisma/schema.prisma` with all 8 entities, updated PrismaClient export, and wired db:generate/migrate/studio scripts.
- 2026-03-22: Wired real API contracts for all domain entities (farm, flockBatch, dailyRecord, expense, sale). REST and tRPC endpoints now use Prisma queries. Added seed script for development data.
- 2026-03-22: Built mobile app design system with centralized theme tokens (colors, spacing, typography, radii) and reusable UI primitives (Text, Card, Button, Input, Screen). Refactored all Expo screens to use the design system with zero inline color values. Fixed stale tRPC hook references.
- 2026-03-22: Wired mobile daily record flow — converted to tab navigation (Home, Record, History), connected record form to tRPC `dailyRecord.create` mutation with loading/error/success states, added history screen listing recent records from the API.
- 2026-03-22: Added expense and sale entry screens to mobile app. Expanded to 5-tab layout (Home, Record, Expenses, Sales, History). Both screens have list+form toggle pattern with category/type pickers, amount entry in Naira (converted to kobo), and tRPC mutation wiring. Enhanced dashboard with real `dailyRecord.summary` metrics (eggs, feed, mortality) and active flock batch display.
- 2026-03-22: Migrated Expo app from inline StyleSheet styles to NativeWind v4. Added tailwind.config.js with custom Farm OSS color tokens, global.css, and metro.config.js integration. Rewrote all UI components (Text, Card, Button, Input, Screen) and all screens to use `className` props. Removed old theme directory — color tokens now live in Tailwind config.
- 2026-03-22: Added battery cage management — CageUnit and CageProduction Prisma models, tRPC routers (cageUnit CRUD + cageProduction list/create/summary), Cages tab in mobile app with add/production-record forms.
- 2026-03-22: Enhanced cage management with detail/history view, per-cage feed tracking (feedGrams, waterMl fields), cage production summary on list and dashboard, seed data for cages and production records. Updated brain docs with CageUnit and CageProduction entities.
- 2026-03-29: Added role-based access control (RBAC). Three tRPC procedure tiers: `publicProcedure`, `protectedProcedure` (any auth), `managerProcedure` (manager+), `ownerProcedure` (owner only). Bearer token parsed in `createTRPCContext`. All domain router mutations gated by role. See `brain/api/permissions.md`.
- 2026-03-29: Renamed `staff` role → `worker`. Worker role is now farm-scoped via new `FarmMember` table (farmId, userId, role). Owners/managers retain tenant-wide access. New `assertFarmAccess(ctx, farmId)` helper enforces farm access in all resolvers. `farm.list` filters to assigned farms for workers. New `farmMember` tRPC router: assign (manager+), remove (owner), list, listByUser.
- 2026-03-29: Implemented fish pond management domain. New models: `PondBatch` (species, stockingCount, currentCount, avgWeightG, waterType, status) and `PondRecord` (feed, water quality metrics, mortality, partial harvest). New tRPC routers: `pondBatch` and `pondRecord` with full CRUD and daily summary. Mortality + harvest transactions keep `currentCount` in sync.
- 2026-03-29: Established scalable farm type architecture. `Farm.farmType` field (`poultry` | `fish`, extensible). `Expense`, `Sale`, `Alert` gain optional `pondBatchId` FK alongside `flockBatchId`. `Sale.saleType` adds `fish`. `Alert.alertType` adds `water_quality`. New farm types: add domain tables + optional FK on shared models.
- 2026-03-29: Created `CLAUDE.md` at project root with brain-first rules, update checklist, and key project conventions for all future AI sessions.
