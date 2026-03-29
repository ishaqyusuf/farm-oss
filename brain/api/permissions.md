# API Permissions

## Purpose
This file records access rules for API operations.

## How To Use
- Update when roles or authorization rules change.
- Keep role names consistent with the product.
- Note tenant boundaries explicitly.

## Roles

### Tenant-level roles (User.role)
- **owner** – full access to all farms, can manage users and billing
- **manager** – operational access to all farms, no user/billing management
- **worker** – farm-scoped access only (replaces `staff`; previously tenant-wide, now farm-based)

### Farm-level membership (FarmMember table)
Workers must be explicitly assigned to each farm they can access via the `farm_member` table.
Owners and managers have implicit tenant-wide access and do not require FarmMember entries.

## Access Rules

| Operation | owner | manager | worker |
|-----------|-------|---------|--------|
| List/get farm data | ✅ all farms | ✅ all farms | ✅ assigned farms only |
| Create/update records | ✅ | ✅ | ✅ |
| Create/update batches, expenses, sales | ✅ | ✅ | ❌ |
| Delete resources | ✅ | ❌ | ❌ |
| Assign/remove farm members | ✅ | assign only | ❌ |
| Create/update farms | ✅ | ✅ | ❌ |
| Delete farms | ✅ | ❌ | ❌ |

## Implementation
- tRPC procedures: `publicProcedure`, `protectedProcedure`, `managerProcedure`, `ownerProcedure`
- Farm-scoped access: `assertFarmAccess(ctx, farmId)` helper in `apps/api/src/trpc/init.ts`
- Workers are filtered to assigned farms in list queries via FarmMember join
