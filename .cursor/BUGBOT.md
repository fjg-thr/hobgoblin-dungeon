# Cursor Bugbot review guide

Use this guide for all Bugbot reviews in this repository.

## Project context

- This is a Next.js app that hosts a Phaser-based dark isometric dungeon prototype.
- `src/game/GameCanvas.tsx` is the React boundary that dynamically boots Phaser on the client.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state, scene lifecycle, input, combat, spawning, UI overlays, and audio.
- `src/game/maps/startingDungeon.ts` generates the dungeon grid and collision-relevant tile metadata.
- `src/game/assets/manifest.ts` is the typed source of truth for public asset paths and sprite-sheet metadata.
- `public/assets/**` contains runtime assets and JSON metadata consumed by Phaser.
- `tools/**` and `scripts/**` are local asset/audio generation utilities; changes there should not affect the browser bundle unless their generated outputs are committed.

## Review priorities

1. Flag runtime crashes in browser-only code, especially accidental server-side access to `window`, Phaser, or DOM APIs outside client-only boundaries.
2. Check Phaser lifecycle changes for leaked game instances, timers, tweens, event listeners, keyboard handlers, audio instances, or stale scene objects after unmount/restart.
3. Validate gameplay invariants around health, ammo, projectile lifetime, enemy respawn, pickup spawning, collision checks, and game-over/start-screen transitions.
4. Watch for asset manifest drift: every new manifest key/path/frame size should match files and sprite metadata under `public/assets`.
5. Review map-generation edits for unreachable player/enemy starts, blocked stairs, invalid tile codes, out-of-bounds grid access, and mismatches with `isTileBlocked`.
6. Treat large `DungeonScene.ts` edits as high risk; look for unintended coupling between input, simulation, rendering depth, UI state, and audio state.
7. For visual/gameplay changes, prefer deterministic reasoning from constants and state transitions over subjective style feedback.

## Code style expectations

- Preserve strict TypeScript types and existing module boundaries.
- Keep React components client/server-safe; the Phaser game should stay behind the `"use client"` boundary.
- Prefer small helpers and early returns when editing gameplay logic, but avoid broad refactors unrelated to the reviewed change.
- Keep asset paths absolute from `public` (for example, `/assets/...`) to match existing Phaser loading.
- Do not suggest adding new dependencies unless the change clearly needs them.

## Verification guidance

- For code changes, `npm run build` is the primary repository-wide verification command.
- If lint tooling is available in the installed Next.js version, run `npm run lint`; otherwise report that the script is unavailable or unsupported.
- For asset-generation changes, verify both the generation script and the committed generated outputs when possible.
- Manual gameplay checks should cover booting the game, start screen, movement, firing, pickups, enemy contact damage, mute toggle, game over, and restart.
