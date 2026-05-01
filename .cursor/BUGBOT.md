# Bugbot review guide

This repository is a Next.js App Router prototype for a Phaser-based dungeon
game. Use this file as project-specific context when reviewing pull requests.

## Project shape

- `src/app/page.tsx` mounts the client-only game canvas.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`, creates
  one `Phaser.Game`, and destroys it on unmount. Be careful with React Strict
  Mode: changes that remove the `gameRef` guard or effect cleanup can create
  duplicate Phaser instances.
- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: Phaser preload,
  create, update, map rendering, player input, enemy AI, projectiles, pickups,
  HUD, audio, start screen, restart flow, and game-over flow.
- `src/game/assets/manifest.ts` is the canonical source for runtime asset keys
  and paths.
- `src/game/maps/startingDungeon.ts` defines dungeon tile codes, procedural map
  generation, collision rules, and helpers.
- `tools/` contains offline asset-generation and processing scripts. Runtime code
  should not depend on these scripts being available in production.

## Review priorities

Focus on bugs with user-visible gameplay impact, runtime crashes, state leaks,
or asset/collision mismatches. Cosmetic implementation preferences are less
important unless they hide a real defect.

Pay special attention to these invariants:

1. Asset keys in `assetManifest` must stay aligned with Phaser texture/audio keys
   used in `DungeonScene`. Renaming a manifest key without updating all texture,
   animation, or `playSfx` call sites will break at runtime.
2. Spritesheet frame dimensions, frame counts, row offsets, and animation ranges
   in `DungeonScene` must match the actual PNG sheet layouts. Many animations use
   hard-coded frame ranges.
3. New map tile codes must update `TileCode`, `tileAssetForCode`, and
   `isTileBlocked` together. Bridges, stairs, and floor variants are intentionally
   walkable; spaces, walls, and high wall tiles are blocked.
4. Generated `DungeonMap.rows` must keep `height` rows and each row must keep the
   declared `width`. Bounds helpers expect single-character tile codes.
5. Start, restart, and game-over paths have different cleanup responsibilities.
   If a PR adds new entity collections, timers, tweens, audio handles, or input
   listeners, verify they are cleared in all relevant paths.
6. The update loop intentionally early-returns for pre-start, game-over,
   player-death, and hit-stop states. New behavior that must always run should be
   placed before the relevant return or explicitly justified.
7. Local storage mute persistence uses the `hobgoblin-dungeon-muted` key. Changes
   should preserve existing user preference behavior unless the migration is
   intentional.
8. `metadataPath` values in the asset manifest are mostly documentation for
   source sheets; runtime loading generally relies on the manifest's dimensions
   and hard-coded frame math.

## Expected verification

There is no automated test suite in this repository today. For code changes,
expect at least:

- `npm run build`
- `npm run lint` when lint configuration is present and the script is functional

For gameplay or asset changes, also ask for manual browser verification of the
affected flow because many rendering and timing issues are only visible at
runtime.
