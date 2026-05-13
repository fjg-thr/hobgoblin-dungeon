# Bugbot Review Instructions

Review this repository as a Next.js web game prototype that renders a Phaser dungeon scene inside React. Prioritize bugs that can break builds, regress gameplay, or leave assets and scene state inconsistent.

## Project context

- The app entry points live under `src/app`; `src/game/GameCanvas.tsx` owns the client-side Phaser mount.
- Most gameplay logic is in `src/game/scenes/DungeonScene.ts`; map data is in `src/game/maps/startingDungeon.ts`.
- Asset paths, Phaser texture keys, sprite dimensions, and typed asset keys are centralized in `src/game/assets/manifest.ts`.
- Generated and processed art/audio assets live under `public/assets`; scripts in `tools/` create or process those files.

## Review focus

- Treat `npm run build` as the primary verification command for code changes.
- Flag changes that use browser-only APIs during server rendering. Phaser and `window`/`document` access should stay behind client-only boundaries.
- Flag asset manifest entries that do not match files under `public/assets`, mismatched sprite dimensions, duplicate Phaser keys, or metadata references that are not loaded where the asset is used.
- In `DungeonScene.ts`, watch for state that is not reset between runs, timers/listeners/tweens that are not cleaned up, and pooled objects that can be reused while still active.
- For movement, collision, spawning, projectiles, pickups, health, scoring, and powerups, look for regressions in edge cases such as game over, restart, paused/muted audio, and empty ammo.
- Prefer small, actionable findings tied to likely runtime failures. Avoid style-only comments unless they hide a real maintainability or correctness issue.

## Generated assets and large files

- Do not request manual edits to generated binary assets or processed sprite sheets unless the PR explicitly changes asset generation.
- For generated JSON sprite metadata, focus on schema consistency, frame names/counts, dimensions, and alignment with the consuming TypeScript code.
