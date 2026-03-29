# AI Prompt Rules

## Purpose
This file captures prompt and collaboration rules that should guide future AI sessions in this repository.

## How To Use
- Update when recurring instructions prove useful.
- Keep rules specific enough to shape behavior.
- Remove stale guidance when the project evolves.

## Prompt Rules
- Always read the relevant `brain/` files before starting any task.
- Always update the relevant `brain/` files after completing any task.
- Start from the active product direction: multi-farm-type operations tracking (poultry + fish, extensible).
- Optimize for simplicity and speed of daily data entry.
- Avoid broad enterprise design unless there is a clear product need.
- Favor mobile-first workflows and low-friction UX.
- When adding new systems, document them in the brain immediately.
- When making significant architecture choices, create an ADR in `brain/decisions/`.
- Domain models are farm-type scoped. Do not mix poultry and fish models.
- Shared models (Expense, Sale, Alert) accept optional batch FK for each farm type.

## Product Heuristics
- Daily record entry should feel lightweight.
- Profit visibility matters more than feature breadth.
- Poultry is the established standard model for workflows and analytics.
- Fish pond workflows follow the same batch-and-daily-record pattern as poultry.
- Workers are assigned per farm; do not assume tenant-wide access for them.
- New farm types: add `farmType` value + domain tables + optional FK on Expense/Sale/Alert.
