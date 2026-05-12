# Cursor Bugbot Review Guidance

Use these repository-specific notes when reviewing changes in this project. This
is a Next.js App Router + React + TypeScript prototype that boots a Phaser 4
game from a client component.

## Project shape

- `src/app/layout.tsx` defines site metadata and the app shell.
- `src/app/page.tsx` mounts the game surface.
- `src/app/globals.css` owns the full-viewport layout, canvas rendering hints,
  and overlay styling.
- `src/game/GameCanvas.tsx` is the client-only Phaser bootstrap. It dynamically
  imports Phaser and `DungeonScene`, creates the game, and destroys it during
  React effect cleanup.
- `src/game/scenes/DungeonScene.ts` contains most gameplay systems: preload,
  scene setup, input, player/enemy state, projectiles, pickups, HUD, audio,
  start/game-over flows, object pools, debug overlay, and the per-frame update.
- `src/game/assets/manifest.ts` is the central asset manifest for sprite sheets,
  audio, and frame metadata.
- `src/game/maps/startingDungeon.ts` generates the dungeon map and exposes tile
  helpers used by the scene.
- `public/assets/**` stores runtime PNG, JSON, and audio assets. Tooling under
  `tools/` and `scripts/` is for local asset generation and processing.

## Verification expectations

- Prefer `npm ci` before local verification because the repo contains
  `package-lock.json`.
- Run `npm run build` for production build and TypeScript coverage.
- `npm run lint` is still listed in `package.json`. If it fails before ESLint
  runs because Next resolves `lint` as an invalid project directory, report that
  as a tooling incompatibility. If ESLint runs and reports rule violations,
  treat those findings as real source issues.
- There is no dedicated automated test suite in this repository. For gameplay
  changes, ask for or perform a short manual run-through of the affected flows
  in addition to the build.
- Asset-generation scripts are only expected when source assets or generated
  sprite/audio outputs change.

## Review focus areas

- Phaser runs only on the client. Flag server-rendered code paths that access
  `window`, Phaser globals, browser audio APIs, or DOM-only APIs without a
  client boundary or guard.
- `GameCanvas.tsx` runs under React strict mode. Watch for new effects,
  listeners, timers, dynamic imports, or Phaser game instances that do not have
  deterministic cleanup and could double-register on remount.
- `DungeonScene.ts` is a large stateful scene. Review changes for lifecycle
  ordering (`preload` -> `create` -> `update`), stale state after restart,
  unbounded object creation, listener leaks, timer leaks, pool exhaustion, and
  flags that can get stuck across start, game-over, or player-death transitions.
- Keep asset references consistent across code, JSON atlas files, and files
  under `public/assets/**`. A manifest key, frame size, or path mismatch usually
  appears at runtime, not as a TypeScript error.
- Preserve documented intentional limitations from `README.md` unless a change
  explicitly targets them. Do not report cosmetic staircases, simple contact
  damage, or known prototype progression limits as bugs by themselves.
- `createDungeon(random?)` accepts an injectable random source. Layout or spawn
  changes should keep that seam intact so reviewers and future tests can
  reproduce generated maps.
- Phaser 4 is pinned to `4.0.0-rc.4`. Verify lifecycle and API assumptions
  against that pinned version, avoid Phaser 3 snippets, and watch for RC-to-RC
  API differences.
- Dependency changes that involve `next`, `react`, `react-dom`, `typescript`, or
  `phaser` need an explicit build result because several versions are declared
  as `latest` in `package.json`.
- For asset-pipeline changes, verify that generated JSON and PNG/audio outputs
  are updated together and that source image prompts or processing tools remain
  in sync with `README.md` and `ASSET_PROMPTS.md`.
