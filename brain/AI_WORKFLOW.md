# AI Workflow

## Purpose
This file defines how AI agents should work in this repository so changes stay consistent and well-documented.

## How To Use
- Read before major implementation work.
- Update when the team changes expectations for planning, coding, or documentation.
- Keep instructions actionable and repo-specific.

## Workflow
1. Read relevant brain files before making changes.
2. Confirm the active product scope and task in `brain/tasks/`.
3. Implement the smallest useful increment.
4. Verify changes with the best available checks.
5. Update affected brain files after code or scope changes.

## Required Updates After Changes
- Update `brain/PROJECT_INDEX.md` when structure changes.
- Update `brain/system/` files when architecture or stack changes.
- Update `brain/database/` files when schema changes.
- Update `brain/api/` files when contracts or permissions change.
- Update `brain/tasks/` files as work moves forward.
- Add ADRs in `brain/decisions/` for important long-term decisions.

## Working Style
- Prefer simple solutions that reduce adoption friction.
- Preserve clarity over cleverness.
- Keep documentation concise, current, and easy for AI to parse.
