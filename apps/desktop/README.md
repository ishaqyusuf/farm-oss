# Farm OSS Desktop

Tauri-based desktop shell for Farm OSS, initialized from the same app pattern used in Midday and adapted for a farm operations workflow.

## Environments
- Development: `http://localhost:3901`
- Staging: `https://staging.farm-oss.app`
- Production: `https://app.farm-oss.app`

## Commands
- `bun run --cwd apps/desktop tauri:dev`
- `bun run --cwd apps/desktop tauri:staging`
- `bun run --cwd apps/desktop tauri:prod`

## Notes
- The desktop shell currently loads the dashboard inside a native window.
- The next step is wiring farm-specific desktop capabilities if we need offline workflows, file import, or native notifications.

