# Bugbot Review Guide

Use this guidance when reviewing pull requests in this repository. Prioritize issues
that can cause runtime failures, gameplay regressions, broken assets, or production
build failures.

## Project context

- This is a Next.js app-router project that hosts a Phaser-based browser game.
- `src/app/**` contains the React/Next shell. Phaser should remain isolated to
  client-side code such as `src/game/GameCanvas.tsx`.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state, input handling,
  rendering, combat, audio, and scene lifecycle behavior.
- `src/game/maps/startingDungeon.ts` generates the dungeon map and collision
  layout.
- `src/game/assets/manifest.ts` maps logical game assets to files under
  `public/assets/**`.
- TypeScript strict mode is enabled. Prefer fixes that preserve type safety over
  broad casts or `any`.

## Review priorities

1. Flag code that can import Phaser or browser-only APIs into server components,
   metadata files, or other server-side Next.js paths.
2. Check Phaser scene lifecycle changes for leaked timers, event listeners,
   tweens, sounds, game objects, or stale references after scene restart/destroy.
3. Verify gameplay state changes preserve core invariants: health cannot go below
   zero, ammo cannot become negative, pickups cannot be collected twice, enemies
   cannot attack after death, and game-over/restart paths reset transient state.
4. For asset changes, confirm manifest entries, sprite metadata, frame sizes,
   animation frame ranges, and referenced files stay in sync.
5. For map or collision changes, look for out-of-bounds tile access, unreachable
   player starts, blocked corridors, and mismatches between rendered tiles and
   collision checks.
6. For input and UI changes, verify keyboard, mouse, and touch/click paths remain
   usable and that interactive React elements keep appropriate labels/semantics.
7. For update-loop changes, flag expensive per-frame allocations, unbounded object
   growth, or work that scales with all map tiles/enemies without cleanup.
8. Validate changes against `npm run build` when possible. If linting is touched,
   also check the relevant lint/type command available in `package.json`.

## Noise to avoid

- Do not request broad rewrites of `DungeonScene.ts` unless the changed code
  introduces a concrete bug or risk.
- Do not nitpick generated asset JSON/PNG output unless it is inconsistent with
  the code that consumes it.
- Do not block on stylistic preferences when the change follows nearby patterns
  and passes the project validation commands.
