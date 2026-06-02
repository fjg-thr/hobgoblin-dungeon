# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Prioritize concrete regressions that affect gameplay, builds, or the ability to run the prototype.

## Project context

- This is a Next.js App Router prototype with a browser-only Phaser 4 game.
- The React/Next shell lives in `src/app`.
- Phaser is dynamically imported and mounted by `src/game/GameCanvas.tsx`.
- Most runtime behavior lives in `src/game/scenes/DungeonScene.ts`.
- Generated asset references are centralized in `src/game/assets/manifest.ts`.
- Runtime assets are served from `public/assets`.

## High-priority review focus

### Next.js and client boundaries

- Flag direct `window`, `document`, browser audio, or Phaser usage in server components.
- `GameCanvas.tsx` must stay a client component and should keep Phaser imports inside client-only execution paths.
- Metadata in `src/app/layout.tsx` should remain serializable and safe during server rendering.

### Phaser lifecycle

- Look for event listeners, timers, tweens, sounds, textures, and game objects that are created without cleanup.
- The React cleanup path should destroy the Phaser game exactly once and leave no mounted canvas behind.
- Scene restarts should reset per-run arrays, containers, counters, input state, and audio references without duplicating objects.

### Gameplay regressions

- Flag changes that can soft-lock a run, especially around start/game-over screens, staircase/objective flow, ammo pickup spawning, player health, or enemy spawn pressure.
- Confirm collision and camera changes still account for the isometric coordinate model in `startingDungeon.ts` and `DungeonScene.ts`.
- Be skeptical of changes that make enemies, projectiles, pickups, or power-ups persist across restarts.

### Asset and manifest consistency

- Every asset path added to `assetManifest` should exist under `public/assets`.
- Sprite sheet frame sizes, row counts, and animation frame ranges should match the referenced JSON or image sheet.
- New generated assets should be listed in the README asset list when they are part of the playable prototype.

### Build and dependency hygiene

- Treat `npm run typecheck` and `npm run build` failures as release-blocking.
- Do not allow dependency specifiers such as `latest` for runtime or development dependencies.
- Keep lockfiles consistent with `package.json`.

## Review style

- Prefer a small number of actionable findings over broad commentary.
- Include file and line references for every finding.
- Call out missing tests or manual verification only when the changed behavior has meaningful risk.
