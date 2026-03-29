# Farm OSS — Claude Code Instructions

## Brain-First Rule
The `/brain` folder is the single source of truth for all project knowledge.
**Before starting any task, read the relevant brain files.**
**After completing any task, update the relevant brain files.**

### What to read before starting
- `brain/BRAIN.md` — project overview and current state
- `brain/AI_WORKFLOW.md` — workflow rules for this repo
- `brain/AI_PROMPT_RULES.md` — prompt and heuristic rules
- `brain/tasks/in-progress.md` — what is actively being worked on
- `brain/tasks/backlog.md` — upcoming work

### What to update after completing work
| What changed | Update this file |
|---|---|
| New apps, packages, or major modules | `brain/PROJECT_INDEX.md` |
| Architecture or tech stack | `brain/system/architecture.md`, `brain/system/tech-stack.md` |
| Database schema | `brain/database/schema.md`, `brain/database/relationships.md` |
| API contracts or permissions | `brain/api/endpoints.md`, `brain/api/permissions.md` |
| Task completed | Move from `brain/tasks/in-progress.md` → `brain/tasks/done.md` |
| New backlog item | Add to `brain/tasks/backlog.md` |
| Major architecture decision | Create ADR in `brain/decisions/` using `brain/templates/adr.md` |
| New feature spec | Create in `brain/features/` using `brain/templates/feature.md` |
| Bug found or fixed | Document in `brain/bugs/` using `brain/templates/bug.md` |
| Project state summary changes | `brain/BRAIN.md` |

## Project Overview
Farm OSS is a multi-tenant poultry and fish farm management SaaS.
Stack: Bun + Turbo monorepo, Hono + tRPC API, Next.js dashboard, Expo mobile, Prisma + PostgreSQL.

## Key Rules
- Develop on the designated feature branch (check task description for branch name).
- Commit and push after completing work. Do not create PRs unless explicitly asked.
- Keep implementations simple — no speculative abstractions.
- Domain models are farm-type specific (poultry vs fish). Shared models (Expense, Sale, Alert) reference batch via optional FKs.
- Workers are farm-scoped via `FarmMember`. Owners and managers have tenant-wide access.
- All monetary values stored as integer minor units (kobo). Weight in grams.
- Run `bunx prisma generate --schema packages/db/prisma/schema.prisma` after schema changes.
