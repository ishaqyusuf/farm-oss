# Database Schema

## Purpose
This file captures the logical schema for the product and should evolve with implementation.

## How To Use
- Update when entities, fields, or invariants change.
- Keep this file at the logical model level first.
- Add implementation-specific notes once the database exists.

## Initial Domain Entities
- Tenant
- User
- Farm
- FlockBatch
- DailyRecord
- Expense
- Sale
- Alert

## Early Entity Notes
- `Tenant`: owning organization or account boundary.
- `Farm`: operational unit under a tenant.
- `FlockBatch`: grouped poultry batch with type, start date, and size.
- `DailyRecord`: operational metrics captured for a date and batch.
- `Expense`: farm or batch expense such as feed or medication.
- `Sale`: eggs sold, birds sold, or other farm revenue.
- `Alert`: derived issue such as high mortality or low production.

## To Define
- Required fields for each entity
- Soft delete and audit fields
- Currency and unit conventions
- Cross-farm reporting needs
