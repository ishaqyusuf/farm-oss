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
