# API Contracts

## Purpose
This file defines request and response expectations for important API operations.

## How To Use
- Update when payloads or validation rules change.
- Focus on stable contract details.
- Link to code or schema definitions once they exist.

## tRPC Procedures

All domain procedures are in `apps/api/src/trpc/routers/domain/`.

### farm
- `farm.list(tenantId)` → Farm[]
- `farm.get(id)` → Farm with active flockBatches
- `farm.create(tenantId, name, location?)` → Farm
- `farm.update(id, name?, location?)` → Farm
- `farm.delete(id)` → soft delete

### flockBatch
- `flockBatch.list(farmId, status?)` → FlockBatch[]
- `flockBatch.get(id)` → FlockBatch with farm info
- `flockBatch.create(farmId, name, birdType, initialCount, startDate)` → FlockBatch
- `flockBatch.close(id, endDate)` → FlockBatch (sets status=closed)

### dailyRecord
- `dailyRecord.list(flockBatchId, limit?)` → DailyRecord[] (most recent first)
- `dailyRecord.get(id)` → DailyRecord with flockBatch and recorder info
- `dailyRecord.create(flockBatchId, recordDate, eggCount?, feedGrams?, mortality?, mortalityNotes?, notes?, recordedBy?)` → DailyRecord. Decrements flockBatch.currentCount when mortality > 0 (transaction).
- `dailyRecord.update(id, eggCount?, feedGrams?, mortality?, mortalityNotes?, notes?)` → DailyRecord. Adjusts flockBatch.currentCount on mortality changes (transaction).
- `dailyRecord.summary(farmId, date?)` → Aggregated egg/feed/mortality totals for all batches on a given date.

### expense
- `expense.list(farmId, flockBatchId?, limit?)` → Expense[]
- `expense.create(farmId, flockBatchId?, category, description?, amount, currency?, expenseDate)` → Expense

### sale
- `sale.list(farmId, flockBatchId?, limit?)` → Sale[]
- `sale.create(farmId, flockBatchId?, saleType, description?, quantity?, unitPrice?, totalAmount, currency?, saleDate)` → Sale

### auth (still demo)
- `auth.session` → demo session payload
- `auth.signIn(email, password)` → demo session payload

### health
- `health` → `{ status: "ok", timestamp }`

## REST Endpoints

All REST endpoints in `apps/api/src/rest/farm.ts`.

### Auth (demo)
- `POST /api/auth/sign-in` → demo session
- `GET /api/auth/session` → demo session

### Farms
- `GET /api/farms?tenantId=` → `{ farms: Farm[] }`
- `POST /api/farms` → `{ farm: Farm }` (201)
- `GET /api/farms/:id` → `{ farm: Farm }` with flockBatches

### Flock Batches
- `GET /api/flock-batches?farmId=` → `{ flockBatches: FlockBatch[] }`
- `POST /api/flock-batches` → `{ flockBatch: FlockBatch }` (201)
- `GET /api/flock-batches/:id` → `{ flockBatch: FlockBatch }` with farm

### Daily Records
- `GET /api/daily-records?flockBatchId=&limit=` → `{ dailyRecords: DailyRecord[] }`
- `POST /api/daily-records` → `{ dailyRecord: DailyRecord }` (201). Decrements batch currentCount on mortality.

### Expenses
- `GET /api/expenses?farmId=` → `{ expenses: Expense[] }`
- `POST /api/expenses` → `{ expense: Expense }` (201)

### Sales
- `GET /api/sales?farmId=` → `{ sales: Sale[] }`
- `POST /api/sales` → `{ sale: Sale }` (201)

## Validation Rules
- UUIDs validated via `z.string().uuid()`
- Dates as ISO strings `YYYY-MM-DD`
- Monetary amounts as positive integers (minor currency units)
- Counts as non-negative integers
- Currency as 3-character string (default NGN)
