# Bugbot review instructions

Review this repository as a Next.js app that hosts a Phaser dungeon prototype. Focus comments on issues that could break the playable game, the production build, or future asset updates.

## Project context

- The app entry point is `src/app/page.tsx`, which renders `src/game/GameCanvas.tsx`.
- Most game behavior lives in `src/game/scenes/DungeonScene.ts`; map generation is in `src/game/maps/startingDungeon.ts`.
- Asset keys and sprite-sheet metadata should stay aligned between `src/game/assets/manifest.ts` and `public/assets/**`.
- Generated asset tooling lives in `tools/` and `scripts/`; avoid requiring it at runtime.

## What to prioritize

- Flag TypeScript errors, invalid imports, server/client boundary mistakes, and browser-only Phaser code that could run during SSR.
- Check gameplay state changes for regressions in player movement, collision, enemy spawning/pathing, projectiles, pickups, health, scoring, and game-over/reset behavior.
- Verify new or renamed assets are represented consistently in the manifest, JSON metadata, and Phaser preload/animation code.
- Watch for changes that introduce timers, listeners, tweens, or game objects without cleanup on scene shutdown or React unmount.
- Prefer deterministic, bounded logic for runtime loops; flag unbounded allocations or per-frame work that could degrade browser performance.
- Confirm user-facing controls and README instructions stay accurate when gameplay behavior changes.

## Verification expectations

- Run `npm run build` for changes that touch app, game, asset manifest, or TypeScript files.
- If a change only updates generated assets or docs, verify the affected files are referenced correctly and explain why a full build was not needed.
