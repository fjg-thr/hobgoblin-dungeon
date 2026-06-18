# Bugbot Review Rules

Use these project-specific rules when reviewing pull requests for this repository.

## Project context

- This is a Next.js app that mounts a Phaser-powered browser game from React.
- Gameplay logic primarily lives in `src/game/scenes/DungeonScene.ts`.
- Asset manifests and sprite metadata live under `public/assets` and `src/game/assets/manifest.ts`.
- TypeScript is strict and should remain strict.

## Review priorities

1. Flag gameplay bugs that can break the main loop, including scene lifecycle leaks, timers/events that are not cleaned up, stale state after restart, and collision or spawn logic that can trap the player.
2. Flag client/server boundary mistakes. Phaser, `window`, DOM APIs, audio, and canvas access must stay client-side.
3. Flag asset regressions: manifest keys must match files in `public/assets`, frame names must match sprite-sheet JSON, and dimensions should stay consistent with Phaser animation usage.
4. Flag changes that make input inaccessible or inconsistent across keyboard, pointer, and restart/game-over flows.
5. Flag dependency and package-manager churn unless it is required for the change. This repo currently contains both npm and pnpm lockfiles, so call out lockfile drift.
6. Require focused tests or a clear manual verification note for changes to gameplay rules, scoring, health/ammo, power-ups, enemy behavior, or app routing/build configuration.

## Style expectations

- Prefer small, typed helpers over expanding already-large gameplay methods.
- Keep rendering and gameplay state updates deterministic where practical.
- Avoid broad refactors that are unrelated to the pull request.
- Preserve pixel-art rendering assumptions: no smoothing, no fractional sprite-sheet frame dimensions, and no accidental asset resizing.
