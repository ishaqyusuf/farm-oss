# ADR-003: Expo Mobile Client For Daily Farm Operations

## Status
- Accepted

## Context
- The product is mobile-first for daily farm activity capture.
- A mobile app was requested using the local `gnd` project as the initialization reference.
- `gnd` uses Expo Router in a monorepo and provides a suitable baseline for a React Native workspace.

## Decision
- Add `apps/expo` as the mobile app workspace.
- Use Expo Router for file-based routing.
- Keep the initial app lightweight with a simple home screen and sample daily record flow.

## Consequences
- Farm OSS now has a mobile-first app entry point aligned with the product’s primary usage mode.
- The app can evolve into real operational workflows without changing the navigation foundation.
- Dependency installation and runtime verification are still needed before the app can be launched locally.

## Alternatives Considered
- Delay mobile until after the web dashboard is more complete
- Use plain React Native CLI instead of Expo
- Build mobile only as a responsive web app

