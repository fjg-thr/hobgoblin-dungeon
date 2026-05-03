# Bugbot Review Guide

This repository is a Next.js app that hosts a Phaser-based dark isometric dungeon prototype. Use this file as project-specific context when reviewing pull requests.

## Project shape

- `src/app` contains the Next.js app shell. `src/app/page.tsx` renders `GameCanvas`.
- `src/game/GameCanvas.tsx` owns the browser-only Phaser game lifecycle and should clean up Phaser instances when React unmounts.
- `src/game/scenes/DungeonScene.ts` contains most gameplay behavior: preload, scene creation, update loop, input handling, combat, pickups, HUD, start/game-over overlays, audio, and cleanup.
- `src/game/maps/startingDungeon.ts` generates tile maps and collision data.
- `src/game/assets/manifest.ts` is the source of truth for game asset keys and public asset paths.
- `public/assets` contains generated sprites, tile images, audio, and JSON sheet metadata used at runtime.
- `tools` and `scripts` contain local asset/audio generation utilities.

## Review priorities

Focus on issues that would cause real defects for players or maintainers:

1. **Phaser lifecycle and cleanup**
   - Ensure event listeners registered with `this.input`, keyboard objects, timers, tweens, animations, and one-shot callbacks are removed or scoped so scene restarts do not duplicate behavior.
   - Check that destroyed sprites, containers, tweens, and textures are not reused later in the update loop.
   - Confirm React Strict Mode does not create multiple active Phaser games from `GameCanvas`.

2. **Gameplay state invariants**
   - Projectiles, enemies, pickups, power-ups, afterimages, and transient effects should be removed from both the display list and their tracking arrays.
   - Health, ammo, scoring, spawn timers, invulnerability, ward/haste/quickshot/blast state, and game-over transitions should remain consistent across start, restart, and cleanup paths.
   - Map coordinates, isometric conversions, tile blocking, bridge/chasm behavior, and enemy navigation should stay aligned with `startingDungeon.ts`.

3. **Asset manifest correctness**
   - New or renamed assets must be added to `src/game/assets/manifest.ts` and committed under `public/assets`.
   - Sprite frame sizes, row counts, keys, metadata JSON, and animation ranges must match the referenced sheets.
   - Public asset paths should remain absolute `/assets/...` paths for Next.js static serving.

4. **Browser and Next.js constraints**
   - Phaser and browser globals must only run client-side. Avoid importing Phaser into server components.
   - Guard access to `window`, `localStorage`, input devices, and audio APIs when code can run outside the browser.
   - Keep TypeScript strictness intact; avoid `any` unless it is isolated and justified.

5. **Input, audio, and accessibility-sensitive UI**
   - Pointer, keyboard, start-screen, restart, and mute controls should not conflict with each other.
   - Audio start/stop/toggle logic should respect browser autoplay restrictions and the persisted mute setting.
   - If React UI is added outside the canvas, use semantic controls and keyboard-accessible interactions.

## Verification commands

When a PR changes TypeScript, React, Phaser scene logic, asset manifests, or build configuration, prefer these checks:

```bash
npm run build
npx tsc --noEmit
```

If dependencies are not installed, run `npm install` first. For asset-only changes, also verify that every changed manifest path has a matching file in `public/assets`.
