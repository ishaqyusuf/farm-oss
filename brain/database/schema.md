# Database Schema

## Purpose
This file captures the logical schema for the product and should evolve with implementation.

## How To Use
- Update when entities, fields, or invariants change.
- Keep this file at the logical model level first.
- Add implementation-specific notes once the database exists.

## Conventions
- All tables use `id` as UUID primary key.
- All tables include `created_at` (timestamp, not null, default now) and `updated_at` (timestamp, not null, auto-updated).
- Soft delete via `deleted_at` (nullable timestamp) on entities that support it: Tenant, Farm, FlockBatch, Expense, Sale.
- Currency stored as integer minor units (e.g. kobo for NGN). A `currency` column (char 3, default `NGN`) accompanies every monetary field.
- Weight stored in grams (integer). Display layer converts to kg.
- Dates without time (e.g. record date) stored as `date` type, not timestamp.
- Enum-like values stored as short text columns with application-level validation.
- All foreign keys use `_id` suffix (e.g. `tenant_id`, `farm_id`).

## Domain Entities

### Tenant
Multi-tenancy boundary. One tenant per paying organization.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| name | text | no | Organization display name |
| slug | text | no | URL-safe unique identifier |
| currency | char(3) | no | Default `NGN` |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: `slug`.

### User
App user. Belongs to exactly one tenant.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| tenant_id | uuid | no | FK → Tenant |
| email | text | no | Login identifier |
| name | text | no | Display name |
| role | text | no | One of: `owner`, `manager`, `staff` |
| password_hash | text | no | Hashed password |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: `email` (global).

### Farm
Operational unit. A tenant can have one or more farms.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| tenant_id | uuid | no | FK → Tenant |
| name | text | no | Farm display name |
| location | text | yes | Free-text address or region |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### FlockBatch
A group of birds managed together. Belongs to a farm.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| name | text | no | Batch label, e.g. "Batch A – Jan 2026" |
| bird_type | text | no | One of: `layer`, `broiler` |
| initial_count | integer | no | Number of birds at batch start |
| current_count | integer | no | Running bird count after mortality/sales |
| start_date | date | no | When the batch was placed |
| end_date | date | yes | When the batch was closed/sold off |
| status | text | no | One of: `active`, `closed`. Default `active` |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### DailyRecord
One record per batch per date. The core operational input.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| flock_batch_id | uuid | no | FK → FlockBatch |
| record_date | date | no | The calendar date this record covers |
| egg_count | integer | yes | Total eggs collected (layers only) |
| feed_grams | integer | yes | Feed consumed in grams (display as kg) |
| mortality | integer | no | Birds lost this day, default `0` |
| mortality_notes | text | yes | Cause of death or observation |
| notes | text | yes | General free-text observation |
| recorded_by | uuid | yes | FK → User who entered the record |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: (`flock_batch_id`, `record_date`) — one record per batch per day.

### Expense
A cost event tied to a farm or a specific batch.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| flock_batch_id | uuid | yes | FK → FlockBatch (null = farm-level expense) |
| category | text | no | One of: `feed`, `medication`, `labor`, `equipment`, `other` |
| description | text | yes | Free-text detail |
| amount | integer | no | Minor currency units (e.g. kobo) |
| currency | char(3) | no | Default `NGN` |
| expense_date | date | no | When the expense occurred |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### Sale
Revenue event. Eggs sold, birds sold, or other farm income.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| flock_batch_id | uuid | yes | FK → FlockBatch (null = farm-level sale) |
| sale_type | text | no | One of: `eggs`, `birds`, `other` |
| description | text | yes | Free-text detail |
| quantity | integer | yes | Number of units sold |
| unit_price | integer | yes | Price per unit in minor currency |
| total_amount | integer | no | Total revenue in minor currency |
| currency | char(3) | no | Default `NGN` |
| sale_date | date | no | When the sale occurred |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### Alert
Derived notification surfaced by the system when metrics indicate an issue.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| flock_batch_id | uuid | yes | FK → FlockBatch |
| alert_type | text | no | One of: `high_mortality`, `low_production`, `low_feed`, `custom` |
| message | text | no | Human-readable alert description |
| severity | text | no | One of: `info`, `warning`, `critical` |
| status | text | no | One of: `active`, `dismissed`. Default `active` |
| triggered_at | timestamp | no | When the alert condition was detected |
| dismissed_at | timestamp | yes | When a user dismissed the alert |
| dismissed_by | uuid | yes | FK → User who dismissed |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

## Key Relationships
- Tenant → has many Farms, Users.
- Farm → belongs to Tenant. Has many FlockBatches, Expenses, Sales, Alerts.
- FlockBatch → belongs to Farm. Has many DailyRecords. Optionally referenced by Expenses, Sales, Alerts.
- DailyRecord → belongs to FlockBatch. Optionally references recording User.
- User → belongs to Tenant. Referenced by DailyRecord (recorded_by) and Alert (dismissed_by).

## Indexes (recommended)
- `daily_record(flock_batch_id, record_date)` — unique, primary lookup.
- `flock_batch(farm_id, status)` — list active batches per farm.
- `expense(farm_id, expense_date)` — expense reporting.
- `sale(farm_id, sale_date)` — revenue reporting.
- `alert(farm_id, status)` — active alert lookup.
- `user(email)` — unique, login lookup.
- `tenant(slug)` — unique, tenant resolution.

## Remaining Decisions
- ORM choice (Drizzle vs Prisma) before implementing schema in code.
- Whether `recorded_by` on DailyRecord should be required or optional.
- Whether to add an `invited_at` / `last_login_at` to User for onboarding tracking.
- Cross-farm reporting: whether to add a denormalized `tenant_id` on FlockBatch and DailyRecord for simpler cross-farm queries, or always join through Farm.
