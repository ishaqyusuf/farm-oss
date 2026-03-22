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
