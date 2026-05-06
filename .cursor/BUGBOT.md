# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js App Router project with a client-only Phaser game mounted from `src/game/GameCanvas.tsx`.
- Gameplay is concentrated in `src/game/scenes/DungeonScene.ts`; map generation lives in `src/game/maps/startingDungeon.ts`.
- Assets are served from `public/assets` and referenced through `src/game/assets/manifest.ts`.

## Review priorities

1. **Client/runtime boundaries**
   - Keep Phaser, `window`, and DOM access inside client components, effects, dynamic imports, or Phaser scene code.
   - Confirm async game boot paths still guard against unmounts and duplicate `Phaser.Game` instances.

2. **Game lifecycle safety**
   - Check that new timers, tweens, event listeners, audio, and Phaser objects are cleaned up or tied to scene shutdown.
   - Watch for state that survives restarts unintentionally, especially around game-over and start-screen flows.

3. **Coordinate and collision invariants**
   - Distinguish tile coordinates, world coordinates, and screen pixels.
   - Preserve map row widths, valid `TileCode` values, and `isTileBlocked` behavior when changing dungeon generation.
   - Verify player, projectile, pickup, prop, and enemy collision radii remain consistent with visual sprites.

4. **Asset and manifest consistency**
   - New asset manifest entries should match files under `public/assets`, frame dimensions, metadata paths, and animation row assumptions.
   - Keep pixel-art rendering crisp: avoid changes that enable smoothing or alter nearest-neighbor scaling unintentionally.

5. **Gameplay balance and determinism**
   - Review spawn rates, power-up unlocks, enemy health, movement speeds, ammo economy, and score changes together.
   - For procedural map changes, check fallback behavior when random generation cannot place enough rooms or entities.

6. **Next.js and TypeScript quality**
   - Prefer typed interfaces for shared data shapes and avoid widening literals that power asset keys or tile codes.
   - Keep React components small and client/server boundaries explicit.

## Verification guidance

- Run `npm run build` for production compile coverage.
- If gameplay, map generation, or asset metadata changes are substantial, add focused unit coverage where practical or document the manual smoke path used.
- Avoid package manager churn unless dependency updates are part of the change.
