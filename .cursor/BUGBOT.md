# Bugbot review rules

This repository is a Next.js + React + TypeScript prototype for a Phaser-based isometric dungeon game. When reviewing changes, prioritize correctness risks that affect runtime gameplay, browser rendering, asset loading, and maintainability.

## Project context

- The app entry point renders `src/game/GameCanvas.tsx`, which dynamically mounts Phaser client-side.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`; it owns scene lifecycle, input, collision, enemy AI, pickups, combat, UI overlays, and audio.
- Dungeon generation and tile metadata live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and animation metadata are coordinated through `src/game/assets/manifest.ts` and JSON files under `public/assets`.

## Review focus

- Flag Phaser lifecycle leaks: event listeners, timers, tweens, sound instances, graphics objects, input handlers, or DOM references that survive scene shutdown or React unmount.
- Verify client-only code does not run during Next.js server rendering. Phaser, `window`, `document`, canvas, and audio access must stay behind client-side boundaries.
- Check TypeScript strictness: avoid `any`, unsafe casts, unchecked nullable values, and untyped data flowing from asset manifests or generated JSON.
- Validate gameplay invariants for health, ammo, score, cooldowns, invulnerability, pickup limits, spawn timing, and difficulty scaling. Watch for off-by-one, unit mismatch, and stale state bugs.
- Review collision, pathfinding, and movement changes against tile-space versus world-space coordinate conversions. Be suspicious of mixing pixels, tiles, milliseconds, and seconds.
- Check that asset additions update all required files together: generated PNG/JSON assets, manifests, preload keys, animation frame names, README asset lists, and processing scripts when relevant.
- For performance-sensitive scene code, flag per-frame allocations, unbounded arrays, expensive path recalculation, and object creation in `update()` that could cause browser jank.
- Ensure controls remain accessible and predictable: keyboard, pointer, mute toggle, start/restart overlays, and debug toggles should not conflict or double-fire.
- Prefer small, localized fixes that match existing patterns. Avoid large unrelated refactors in review suggestions unless they address a concrete bug.

## Validation expectations

- For code changes, expect at least `npm run build` or `npx tsc --noEmit` to pass.
- For gameplay behavior changes, ask for a manual browser smoke test of start, movement, aiming/firing, enemy contact, pickups, mute, game over, and restart.
