# Cursor Bugbot Review Rules

Review pull requests for user-visible bugs, regressions, security issues, and maintainability risks before style concerns. Avoid commenting on purely subjective preferences unless they hide a likely defect.

## Project context

- This is a Next.js app that hosts a Phaser-based isometric dungeon prototype.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Asset manifests live under `src/game/assets` and `public/assets/**/*.json`; referenced files must exist under `public/assets`.
- The app is client-heavy, but `src/app/layout.tsx` and other App Router files still need to respect Next.js server/client boundaries.

## Review priorities

1. Flag changes that can break the game loop, scene lifecycle, input handling, collision, enemy spawning, pickup behavior, scoring, or audio mute state.
2. Check that Phaser timers, tweens, input listeners, DOM listeners, and scene objects are cleaned up or scoped to the active scene.
3. Verify new asset references match existing manifest keys, frame names, dimensions, and paths.
4. Watch for browser-only APIs in server components, hydration mismatches, and missing `"use client"` boundaries in React/Next code.
5. Prefer TypeScript-safe changes. Call out unchecked `any`, unsafe casts, nullable scene objects, or assumptions that can fail during asset load or scene restart.
6. For UI changes, check keyboard accessibility, labels for interactive controls, and readable focus/hover states.
7. For generated or processed assets, confirm source files, derived JSON, and manifest updates stay in sync.

## Validation guidance

When a PR changes code, ask whether this command should pass locally:

```bash
npm run build
```

If a PR changes lint tooling, ask reviewers to validate that tooling separately. If a PR only changes documentation or generated art assets, focus on path correctness and whether the change is intentionally excluded from runtime validation.
