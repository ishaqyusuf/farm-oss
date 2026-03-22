# Architecture

## Purpose
This file documents the current and planned architectural approach for the product.

## How To Use
- Update when major system boundaries or patterns change.
- Add ADR references for important architecture decisions.
- Keep this file focused on structure, not implementation trivia.

## Current Architecture
- Not yet implemented.

## Proposed Early Architecture
- Multi-tenant SaaS foundation.
- Farm-level operational records as the main domain layer.
- Batch-oriented animal grouping for poultry and fish.
- Event-style daily records feeding dashboards and analytics.

## Architectural Principles
- Simplicity first for end-user workflows.
- Shared abstractions only when they serve real product reuse.
- Clear separation between operational input and derived analytics.
- Strong preference for patterns that support mobile UX and offline-friendly evolution.

## Decisions To Make
- Frontend platform split: web only vs web plus mobile.
- API style: REST, tRPC, or equivalent typed interface.
- Tenant and farm hierarchy model.
- Reporting and analytics aggregation strategy.
