# Architecture

## Purpose
This file documents the current and planned architectural approach for the product.

## How To Use
- Update when major system boundaries or patterns change.
- Add ADR references for important architecture decisions.
- Keep this file focused on structure, not implementation trivia.

## Current Architecture
- Bun + Turbo monorepo scaffold is initialized.
- Five app entry points exist: API, dashboard, website, desktop, and Expo mobile.
- Shared packages hold auth, DB types, UI config, utilities, and TypeScript presets.
- The API now has both REST route scaffolding and a tRPC app router foundation.
- Dashboard, website, and Expo now share a `src`-based frontend structure.
- Expo now consumes the API through tRPC and maintains a lightweight local auth session.

## Proposed Early Architecture
- Multi-tenant SaaS foundation.
- Next.js for dashboard and website apps.
- Hono for the API entry point.
- Tauri desktop shell wrapping the dashboard for native distribution.
- Expo Router mobile app for daily operations workflows.
- Farm-level operational records as the main domain layer.
- Batch-oriented animal grouping for poultry and fish.
- Event-style daily records feeding dashboards and analytics.
- Farm type (`farmType` on Farm) drives which domain models apply per farm.
- Workers are farm-scoped via FarmMember; owners and managers have tenant-wide access.

## Farm Type Extensibility
The system is designed to support multiple farm types without shared-model changes:
- `poultry` → FlockBatch, CageUnit, CageProduction, DailyRecord
- `fish` → PondBatch, PondRecord
- Future types add their own domain models alongside existing ones.
- Shared models (Farm, Expense, Sale, Alert) reference the relevant batch type via optional FKs.
- New farm types: add `farmType` value, new domain tables, optional FK on Expense/Sale/Alert.

## Architectural Principles
- Simplicity first for end-user workflows.
- Shared abstractions only when they serve real product reuse.
- Clear separation between operational input and derived analytics.
- Strong preference for patterns that support mobile UX and offline-friendly evolution.

## Decisions To Make
- API contract style beyond the initial Hono scaffold.
- Tenant and farm hierarchy model.
- Reporting and analytics aggregation strategy.
- Whether mobile should become a first-class app early.
