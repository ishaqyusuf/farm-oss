# Database Relationships

## Purpose
This file documents how core entities relate to each other.

## How To Use
- Update when entity relationships or ownership boundaries change.
- Keep one relationship per bullet when possible.
- Note cardinality clearly.

## Initial Relationships
- One `Tenant` has many `Users`.
- One `Tenant` has many `Farms`.
- One `Farm` has many `FlockBatch` records.
- One `FlockBatch` has many `DailyRecord` records.
- One `Farm` has many `Expense` records.
- One `Farm` has many `Sale` records.
- One `Farm` has many `Alert` records.

## Open Questions
- Whether expenses and sales should always attach to a farm and optionally a batch.
- Whether staff activity logs need their own entity.
- Whether alerts should be persisted or generated on demand.
