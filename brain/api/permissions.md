# API Permissions

## Purpose
This file records access rules for API operations.

## How To Use
- Update when roles or authorization rules change.
- Keep role names consistent with the product.
- Note tenant boundaries explicitly.

## Initial Roles
- Owner
- Manager
- Staff

## Early Rules
- Users should only access farms within their tenant.
- Owners can manage billing, users, and all farm data.
- Managers can manage operations and view analytics.
- Staff can enter daily records and view assigned operational data.

## To Define
- Role assignment flow
- Fine-grained edit restrictions
- Cross-farm visibility rules for managers and staff
