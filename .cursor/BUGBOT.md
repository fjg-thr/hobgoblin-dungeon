# Bugbot review rules

Use these project-specific rules when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js App Router project with a client-only React wrapper that boots a Phaser game.
- The Phaser scene is stateful and timing-sensitive; changes can affect gameplay even when TypeScript still compiles.
- Assets are served from `public/assets` and registered through `src/game/assets/manifest.ts`.
- Dungeon layout, blocking rules, and tile coordinate helpers live in `src/game/maps/startingDungeon.ts`.

## Review priorities

1. **Client/server boundaries**
   - Confirm Phaser is only imported from client-side code or dynamic imports.
   - Flag browser APIs used outside `"use client"` components, effects, or Phaser scene code.

2. **Phaser lifecycle and cleanup**
   - Check that input handlers, timers, tweens, sounds, pooled game objects, and scene events are cleaned up or bounded.
   - Watch for duplicated game instances, leaked objects, or effects that keep running after restart/destroy.

3. **Gameplay correctness**
   - Verify tile/world coordinate conversions, collision bounds, enemy pathing, spawn safety, ammo, health, and power-up state transitions.
   - Treat changes to constants in `DungeonScene.ts` as gameplay changes and look for unintended balance regressions.

4. **Asset integrity**
   - Ensure manifest entries match committed files under `public/assets`.
   - For sprite sheets, check frame size, row counts, animation frame ranges, and metadata JSON paths together.
   - Generated binary assets should only change when the PR is explicitly about art/audio.

5. **Runtime performance**
   - Be skeptical of new per-frame allocations, unbounded arrays, repeated texture loads, or expensive searches in update loops.
   - Prefer bounded pools and reuse patterns already present in the scene.

6. **Player-facing behavior**
   - Check keyboard, pointer, sound toggle, start/game-over flow, HUD updates, and debug overlay behavior.
   - Preserve readable pixel-art rendering settings unless the PR intentionally changes the visual style.

## Review style

- Prioritize concrete bugs, regressions, missing cleanup, and missing validation.
- Include file and line references when possible.
- Do not request broad refactors unless they address a specific risk introduced by the PR.
- Recommend fresh validation with `npm run build` and `npm run lint`.
