# API Contracts

## Purpose
This file defines request and response expectations for important API operations.

## How To Use
- Update when payloads or validation rules change.
- Focus on stable contract details.
- Link to code or schema definitions once they exist.

## Initial Contract Areas
- Create farm
- Create flock batch
- Submit daily record
- Create expense
- Record sale
- Fetch dashboard summary
- Fetch alerts

## Current Scaffolded Contracts
- `auth.signIn`: accepts email and password, returns a starter auth session payload
- `auth.session`: returns the current demo session payload
- `farm.listFlocks`: returns starter poultry batch rows for dashboard and mobile integration
- `farm.dailySummary`: returns sample daily production metrics keyed by date
- REST endpoints currently return placeholder JSON and should be replaced with database-backed contracts next

## Template
- Operation:
- Request shape:
- Response shape:
- Validation rules:
- Error cases:
