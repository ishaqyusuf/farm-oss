# Project Brain

## Purpose
This directory is the shared source of truth for product, system, engineering, and delivery knowledge for the farm operations platform.

## How To Use
- Update this brain when architecture, product scope, APIs, data models, or tasks change.
- Prefer concise factual updates over long prose.
- Link new work back to the relevant file in this directory.

## Contents
- `SYSTEM_OVERVIEW.md`: high-level summary of the product and platform.
- `PROJECT_INDEX.md`: current repository structure and major modules.
- `AI_WORKFLOW.md`: expected workflow for AI-assisted development.
- `AI_PROMPT_RULES.md`: prompting and repo guardrails for future sessions.
- `system/`: system and architecture references.
- `product/`: market, roadmap, and product intent.
- `engineering/`: coding and repository conventions.
- `database/`: schema, relationships, and migration notes.
- `api/`: endpoint, contract, and permission notes.
- `features/`: feature specifications.
- `decisions/`: architecture decision records.
- `bugs/`: documented bugs and prevention notes.
- `tasks/`: execution tracking.
- `templates/`: reusable documentation templates.

## Current State
- Multi-tenant SaaS platform supporting poultry and fish farm operations.
- Poultry domain fully implemented: FlockBatch, CageUnit, CageProduction, DailyRecord, Expense, Sale, Alert.
- Fish pond domain implemented: PondBatch, PondRecord (feed, water quality, mortality, harvest tracking).
- RBAC implemented: owner > manager > worker. Worker role is farm-scoped via FarmMember table.
- Mobile app (Expo) covers poultry workflows: daily records, expenses, sales, cage management.
- Fish pond mobile UI and dashboard integration are upcoming.
- All development uses `CLAUDE.md` brain-first rules for AI sessions.
