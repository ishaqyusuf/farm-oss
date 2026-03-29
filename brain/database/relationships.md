# Database Relationships

## Purpose
This file documents how core entities relate to each other.

## How To Use
- Update when entity relationships or ownership boundaries change.
- Keep one relationship per bullet when possible.
- Note cardinality clearly.

## Relationships

### Tenant boundary
- One `Tenant` has many `Users`.
- One `Tenant` has many `Farms`.

### Farm access
- One `Farm` has many `FarmMember` entries (worker assignments).
- One `User` has many `FarmMember` entries (their farm assignments).
- Workers without a `FarmMember` entry for a given farm cannot access it.

### Poultry domain
- One `Farm` has many `FlockBatch` records.
- One `FlockBatch` has many `DailyRecord` records.
- One `FlockBatch` has many `CageUnit` records.
- One `CageUnit` has many `CageProduction` records.

### Fish pond domain
- One `Farm` has many `PondBatch` records.
- One `PondBatch` has many `PondRecord` records.

### Shared financials and alerts
- One `Farm` has many `Expense` records (optionally linked to FlockBatch or PondBatch).
- One `Farm` has many `Sale` records (optionally linked to FlockBatch or PondBatch).
- One `Farm` has many `Alert` records (optionally linked to FlockBatch or PondBatch).

## Resolved Questions
- Expenses and sales attach to a farm and optionally a batch (poultry or fish). ✅
- Alerts are persisted (not generated on demand). ✅
- Worker activity is tracked via `recorded_by` on DailyRecord and PondRecord. ✅
