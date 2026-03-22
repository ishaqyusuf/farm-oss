# ADR-002: Tauri Desktop Shell For Dashboard Access

## Status
- Accepted

## Context
- A desktop app was requested using the Midday project as the setup reference.
- Midday uses a Tauri + Vite workspace under `apps/desktop`.
- Farm OSS may benefit from a native shell for focused dashboard use and future desktop-only capabilities.

## Decision
- Add `apps/desktop` as a Tauri + Vite desktop shell.
- Keep the first version minimal and environment-aware.
- Load the Farm OSS dashboard URL inside a native Tauri window instead of rebuilding dashboard UI separately.

## Consequences
- Farm OSS gains a desktop distribution path without changing the web dashboard architecture.
- The desktop app can later add native integrations such as file import, notifications, and offline support.
- The current setup still needs dependency installation and icon assets before full packaging.

## Alternatives Considered
- Keep desktop out of scope for MVP
- Use Electron instead of Tauri
- Duplicate dashboard UI directly inside the desktop app

