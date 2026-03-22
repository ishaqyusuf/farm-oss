# API Endpoints

## Purpose
This file tracks the public and internal endpoints for the product.

## How To Use
- Update when routes are added, removed, or changed.
- Group endpoints by domain area.
- Keep descriptions short and task-oriented.

## Current REST Endpoints
- `GET /` — API status
- `GET /api/health` — service health check

### Auth (demo)
- `POST /api/auth/sign-in` — demo auth sign-in
- `GET /api/auth/session` — demo session

### Farms (database-backed)
- `GET /api/farms?tenantId=` — list farms for a tenant
- `POST /api/farms` — create a farm
- `GET /api/farms/:id` — get farm with flock batches

### Flock Batches (database-backed)
- `GET /api/flock-batches?farmId=` — list batches for a farm
- `POST /api/flock-batches` — create a batch
- `GET /api/flock-batches/:id` — get batch with farm info

### Daily Records (database-backed)
- `GET /api/daily-records?flockBatchId=&limit=` — list records
- `POST /api/daily-records` — create record (adjusts mortality count)

### Expenses (database-backed)
- `GET /api/expenses?farmId=` — list expenses
- `POST /api/expenses` — create expense

### Sales (database-backed)
- `GET /api/sales?farmId=` — list sales
- `POST /api/sales` — create sale

## tRPC Surface
- `POST /api/trpc/*` — all tRPC procedures (see contracts.md for details)

## Planned
- Dashboard analytics endpoints
- Alert management endpoints
- Real authentication
