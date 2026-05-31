# Hobgoblin Ruin Bugbot Review Guide

## Project context

This repository is a first-playable browser game prototype. Next.js App Router hosts a Phaser 4
isometric dungeon game, and most gameplay behavior currently lives in
`src/game/scenes/DungeonScene.ts`. Assets are registered in `src/game/assets/manifest.ts` and
served from `public/assets/`. Treat this as a playable prototype, not production infrastructure.

## Flag high-signal bugs

- Phaser and React lifecycle regressions: duplicate `Phaser.Game` instances, missing `destroy()` on
  unmount, or input/listener registrations that are not paired with cleanup.
- Restart and game-over leaks: sprites, containers, timers, sounds, or scene state created during play
  without cleanup in restart, dungeon-clear, enemy-clear, or game-over paths.
- Simulation correctness issues: combat, collision, spawning, ammo, cooldown, or power-up changes that
  use an uncapped frame delta where the scene expects capped simulation time.
- Asset drift: changes to asset keys, paths, frame sizes, or preload usage without matching files and
  sprite-sheet metadata under `public/assets/`.
- Map generation regressions: layouts with no playable tiles, blocked player or enemy spawns, broken
  tile-code mappings, or unsafe grid indexing.
- Type safety regressions: new `any`, unnecessary unsafe casts, or changes that break manifest-derived
  asset key unions.
- SSR/client boundary mistakes: importing Phaser or touching browser globals outside client-only code.

## Reduce review noise

- Do not flag `src/game/scenes/DungeonScene.ts` only for being large; the monolithic scene is an
  accepted prototype constraint for now.
- Do not block PRs only because no unit test suite exists yet.
- Do not flag known prototype limitations documented in `README.md`, including the non-functional
  staircase, simple tile/proximity collision, first-pass generated art, and intentionally modest combat.
- Do not object to pixel-art rendering settings such as `pixelArt`, disabled antialiasing, rounded
  pixels, or CSS image-rendering choices.
- Do not flag binary asset diffs in `public/assets/` unless related manifest, preload, or runtime code
  becomes inconsistent.
- Avoid style-only comments for asset prompts, generated metadata, or tooling unless they indicate a
  real runtime or pipeline break.

## Path-specific focus

- `src/game/GameCanvas.tsx`: verify a single Phaser game instance, client-only startup, cleanup on
  unmount, and safe resize behavior.
- `src/game/scenes/DungeonScene.ts`: focus on restart/state reset, pooled object limits, lifecycle
  cleanup, combat edge cases, collision bounds, pickup behavior, and audio cleanup.
- `src/game/maps/startingDungeon.ts`: check grid bounds, `RandomSource` use, reachable playable space,
  and tile-code consistency.
- `src/game/assets/manifest.ts`: keep keys, paths, frame dimensions, and Phaser preload calls aligned.
- `tools/` and `scripts/`: preserve chroma-key assumptions, nearest-neighbor pixel-art processing, and
  output paths under `public/assets/`.

## Review tone

Comment only on concrete defects, likely runtime bugs, or security issues. Prefer inline comments on
the diff and explain the user-visible failure mode. Skip broad refactor suggestions unless they fix an
identified defect in the change under review.
