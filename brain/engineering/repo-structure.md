# Repo Structure

## Purpose
This file documents the repository layout and intended ownership of major areas.

## How To Use
- Update when new top-level directories are introduced.
- Keep path descriptions concise.
- Align with `brain/PROJECT_INDEX.md`.

## Current Layout
- `apps/api/`: API entry point.
- `apps/dashboard/`: dashboard app with UI routes under `src/app/`.
- `apps/desktop/`: Tauri desktop shell for dashboard access.
- `apps/expo/`: Expo Router mobile app with routes under `src/app/`, plus `src/lib/`, `src/providers/`, and `src/trpc/`.
- `apps/website/`: marketing site with UI routes under `src/app/`.
- `packages/auth/`: auth roles and shared auth primitives.
- `packages/db/`: DB entry point and future schema config.
- `packages/tsconfig/`: shared TypeScript presets.
- `packages/ui/`: shared UI package placeholder.
- `packages/utils/`: shared helper utilities.
- `brain/`: project knowledge base and operational documentation.

## Future Additions
- `apps/mobile/`: mobile-first farm operations client if daily usage demands it.
- Additional shared domain packages when the poultry model becomes clearer.
