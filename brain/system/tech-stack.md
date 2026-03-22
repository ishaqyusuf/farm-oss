# Tech Stack

## Purpose
This file tracks the chosen and proposed technologies for the project.

## How To Use
- Replace placeholders with confirmed choices.
- Record why a technology was selected when it affects long-term maintenance.
- Link to ADRs for significant stack decisions.

## Current State
- Initial scaffold committed in repository structure.

## Chosen Foundation
- Workspace: Bun + Turbo monorepo
- Frontend: Next.js app router for dashboard and website
- Mobile: Expo Router on React Native
- Backend: Hono API on Bun
- Desktop: Tauri + Vite shell
- Database: PostgreSQL via local Docker Compose

## Still To Choose
- ORM and schema workflow
- Authentication provider
- Hosting strategy
- Background jobs approach

## Selection Criteria
- Fast product iteration
- Multi-tenant support
- Mobile-friendly architecture
- Good developer productivity
- Low operational complexity for an MVP team
