# Bugbot Review Guide

Use this context when reviewing changes in this repository.

## Project shape

- This is a private Next.js app that hosts a Phaser 4 dungeon prototype.
- The browser-only game bootstraps from `src/game/GameCanvas.tsx`; avoid changes that import Phaser from server components.
- Core game logic lives in `src/game/scenes/DungeonScene.ts`, with map generation in `src/game/maps/startingDungeon.ts` and asset metadata in `src/game/assets/manifest.ts`.
- Generated and processed assets live under `public/assets`; tool scripts in `tools/` and `scripts/` produce or transform those files.

## Review priorities

- Flag server/client boundary regressions, especially code that touches `window`, Phaser, or DOM APIs outside client-only modules or effects.
- Check gameplay state transitions for leaks across restarts, scene shutdown, game over, pause/mute state, timers, tweens, pooled effects, and input handlers.
- Watch for asset manifest mismatches: texture keys, frame names, dimensions, audio keys, generated JSON, and referenced files should stay in sync.
- Inspect collision, spawn, pathfinding, and pickup logic for unreachable states, invalid tile coordinates, out-of-bounds access, or difficulty spikes that can trap the player.
- Verify performance-sensitive code in the main update loop avoids unnecessary allocation, unbounded arrays, and repeated expensive searches.
- Treat changes to procedural asset/audio generation scripts as build artifacts: generated outputs should match the script intent and remain deterministic enough to review.

## Local verification

For code changes, prefer:

```bash
npm run build
```

If dependencies are missing, install them with the repository lockfile before building.
