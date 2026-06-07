# Bugbot review guidance

Review this repository as a first-playable Next.js and Phaser dungeon prototype.
Prioritize issues that can break the browser build, prevent the game from
starting, or regress core player interactions.

## Project context

- The public page is a Next.js client app that dynamically boots Phaser from
  `src/game/GameCanvas.tsx`.
- Most gameplay state, rendering, input, combat, UI overlays, and audio control
  live in `src/game/scenes/DungeonScene.ts`.
- Procedural map generation and collision tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite sheet metadata assumptions are centralized in
  `src/game/assets/manifest.ts`, with generated assets under `public/assets`.

## What to flag

- Changes that can run Phaser during server rendering, skip the client-only
  dynamic import boundary, or leak a game instance during React remounts.
- Gameplay changes that break movement, mouse/keyboard firing, collision,
  camera follow, enemy spawning/pathing, pickups, health/ammo accounting,
  pause/start/game-over flows, or the mute toggle.
- Map-generation edits that can create unreachable player starts, enemy starts
  inside blocked tiles, disconnected rooms, missing stair placement, or tile
  codes without matching render/collision handling.
- Asset-manifest edits where image paths, frame sizes, sprite row counts, or
  animation keys no longer match files in `public/assets`.
- Timing or difficulty changes that create unbounded object growth, excessive
  particle/sprite allocation, or frame-rate-dependent gameplay.
- TypeScript strictness regressions, unchecked nullable Phaser objects, or code
  paths that can throw before assets finish preloading.
- Styling/layout changes that compromise the full-window canvas presentation,
  pixel-art rendering, or keyboard/mouse accessibility.

## Review expectations

- Prefer small, specific findings with the exact user-visible failure mode.
- Treat generated binary assets as supporting evidence; focus review comments on
  the source manifest, processors, or gameplay code that consumes them.
- When a change touches gameplay, expect evidence from `npm run build` and a
  browser smoke test of starting a run, moving, firing, taking/avoiding damage,
  collecting pickups when applicable, and restarting after game over.
- When a change touches asset-processing tools, check that the corresponding
  manifest or README asset list stays in sync.
