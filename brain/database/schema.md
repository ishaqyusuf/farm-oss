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
| user_id | char(6) | no | Unique 6-digit login identifier |
| email | text | no | Login identifier |
| name | text | no | Display name |
| role | text | no | One of: `owner`, `manager`, `worker` |
| password_hash | text | no | Hashed password |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: `email` (global), `user_id` (global).

### FarmMember
Farm-scoped role assignment. Workers must be assigned per farm. Owners/managers have implicit tenant-wide access and do not need entries here.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| user_id | uuid | no | FK → User |
| role | text | no | `worker` (extendable) |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: (`farm_id`, `user_id`).

### Farm
Operational unit. A tenant can have one or more farms. `farm_type` determines which domain models apply.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| tenant_id | uuid | no | FK → Tenant |
| name | text | no | Farm display name |
| farm_type | text | no | `poultry` \| `fish` (default `poultry`) |
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

### CageUnit
Individual cage within a battery cage system. Belongs to a FlockBatch.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| flock_batch_id | uuid | no | FK → FlockBatch |
| label | text | no | Cage identifier, e.g. "A1", "Row-3" |
| bird_count | integer | no | Current number of birds in this cage |
| start_date | date | no | When birds were placed in this cage |
| status | text | no | One of: `active`, `inactive`. Default `active` |
| notes | text | yes | Free-text observation |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: (`flock_batch_id`, `label`) — one label per cage per batch.

### CageProduction
Daily production record per cage unit. Tracks eggs, feed, and mortality at the individual cage level.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| cage_unit_id | uuid | no | FK → CageUnit |
| record_date | date | no | The calendar date this record covers |
| egg_count | integer | no | Eggs collected from this cage, default `0` |
| feed_grams | integer | yes | Feed consumed in grams (display as kg) |
| water_ml | integer | yes | Water consumed in millilitres |
| mortality | integer | no | Birds lost this day, default `0` |
| notes | text | yes | Free-text observation |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: (`cage_unit_id`, `record_date`) — one record per cage per day.

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

### PondBatch
A fish stocking cohort managed together. Belongs to a fish farm.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm (farmType = fish) |
| name | text | no | Batch label |
| species | text | no | `tilapia` \| `catfish` \| `salmon` \| `carp` \| `other` |
| stocking_count | integer | no | Fish placed at start |
| current_count | integer | no | Running count after mortality/harvest |
| avg_weight_g | integer | yes | Average weight per fish at stocking (grams) |
| water_type | text | yes | `fresh` \| `brackish` \| `salt` |
| start_date | date | no | When fish were stocked |
| end_date | date | yes | When batch was harvested/closed |
| status | text | no | `active` \| `harvested` \| `closed`. Default `active` |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### PondRecord
Daily operational record per pond batch. Core fish pond input.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| pond_batch_id | uuid | no | FK → PondBatch |
| record_date | date | no | The calendar date |
| feed_grams | integer | yes | Feed in grams (display as kg) |
| feed_type | text | yes | `pellets` \| `live` \| `mixed` \| `other` |
| ph_level | float | yes | Water pH (range 0–14, healthy 6.5–8.5) |
| dissolved_oxygen_mgl | float | yes | Dissolved oxygen mg/L (healthy >5) |
| water_temp_c | float | yes | Water temperature in Celsius |
| water_change_percent | integer | yes | % of pond water replaced |
| mortality | integer | no | Fish lost, default `0` |
| mortality_notes | text | yes | Cause of death or observation |
| harvest_count | integer | no | Fish removed (partial harvest), default `0` |
| harvest_weight_g | integer | yes | Total harvest weight in grams |
| notes | text | yes | General observation |
| recorded_by | uuid | yes | FK → User |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

Unique: (`pond_batch_id`, `record_date`) — one record per batch per day.

### Expense
A cost event tied to a farm or a specific batch. Supports both poultry and fish batch references.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| flock_batch_id | uuid | yes | FK → FlockBatch (poultry; null = farm-level) |
| pond_batch_id | uuid | yes | FK → PondBatch (fish; null = farm-level) |
| category | text | no | One of: `feed`, `medication`, `labor`, `equipment`, `other` |
| description | text | yes | Free-text detail |
| amount | integer | no | Minor currency units (e.g. kobo) |
| currency | char(3) | no | Default `NGN` |
| expense_date | date | no | When the expense occurred |
| deleted_at | timestamp | yes | Soft delete |
| created_at | timestamp | no | |
| updated_at | timestamp | no | |

### Sale
Revenue event. Supports poultry and fish batch references.

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | no | PK |
| farm_id | uuid | no | FK → Farm |
| flock_batch_id | uuid | yes | FK → FlockBatch (poultry; null = farm-level) |
| pond_batch_id | uuid | yes | FK → PondBatch (fish; null = farm-level) |
| sale_type | text | no | One of: `eggs`, `birds`, `fish`, `other` |
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
| flock_batch_id | uuid | yes | FK → FlockBatch (poultry) |
| pond_batch_id | uuid | yes | FK → PondBatch (fish) |
| alert_type | text | no | One of: `high_mortality`, `low_production`, `low_feed`, `water_quality`, `custom` |
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
- Farm → belongs to Tenant. Has many FlockBatches (poultry), PondBatches (fish), Expenses, Sales, Alerts, FarmMembers.
- FarmMember → links User ↔ Farm with a farm-scoped role. Workers require an entry; owners/managers do not.
- FlockBatch → belongs to Farm (poultry). Has many DailyRecords, CageUnits. Optionally referenced by Expenses, Sales, Alerts.
- CageUnit → belongs to FlockBatch. Has many CageProductions.
- CageProduction → belongs to CageUnit. Mortality decrements CageUnit.birdCount via transaction.
- DailyRecord → belongs to FlockBatch. Optionally references recording User.
- PondBatch → belongs to Farm (fish). Has many PondRecords. Optionally referenced by Expenses, Sales, Alerts.
- PondRecord → belongs to PondBatch. Mortality + harvestCount decrements PondBatch.currentCount via transaction.
- User → belongs to Tenant. Referenced by DailyRecord, PondRecord (recorded_by) and Alert (dismissed_by). Has many FarmMemberships.

## Indexes (recommended)
- `daily_record(flock_batch_id, record_date)` — unique, primary lookup.
- `flock_batch(farm_id, status)` — list active batches per farm.
- `cage_unit(flock_batch_id, status)` — list active cages per batch.
- `cage_unit(flock_batch_id, label)` — unique, cage label per batch.
- `cage_production(cage_unit_id, record_date)` — unique, one record per cage per day.
- `expense(farm_id, expense_date)` — expense reporting.
- `sale(farm_id, sale_date)` — revenue reporting.
- `alert(farm_id, status)` — active alert lookup.
- `user(email)` — unique, login lookup.
- `tenant(slug)` — unique, tenant resolution.

## Remaining Decisions
- Whether `recorded_by` on DailyRecord should be required or optional.
- Whether to add an `invited_at` / `last_login_at` to User for onboarding tracking.
- Cross-farm reporting: whether to add a denormalized `tenant_id` on FlockBatch and DailyRecord for simpler cross-farm queries, or always join through Farm.

## Implementation
- ORM: Prisma v7 (ADR-004).
- Schema file: `packages/db/prisma/schema.prisma`.
- Config file: `packages/db/prisma.config.ts`.
- Generated client: `packages/db/generated/prisma` (gitignored).
- Singleton export: `packages/db/src/index.ts`.
