# Cursor Bugbot review rules

Use these project-specific rules when reviewing pull requests for Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js web game prototype. The app shell is React, while gameplay runs in Phaser from `src/game/GameCanvas.tsx` and `src/game/scenes/DungeonScene.ts`.
- `GameCanvas` is a client component and dynamically imports Phaser plus the dungeon scene. Treat accidental server-side Phaser imports or direct `window` access outside client-only code as likely runtime bugs.
- The main game state, input handling, combat, pickups, audio, and UI overlays live in one Phaser scene. Review lifecycle changes carefully because stale timers, tweens, event handlers, pooled objects, or scene restarts can create bugs that are hard to notice in a diff.
- Dungeon generation and tile rules live in `src/game/maps/startingDungeon.ts`. Tile codes, collision behavior, spawn placement, and isometric coordinate conversions are core invariants.
- Runtime asset paths and frame dimensions are centralized in `src/game/assets/manifest.ts`, with generated assets under `public/assets`.

## Flag these issues

- Client/server boundary regressions: importing Phaser into server components, touching browser globals before client mount, or booting multiple Phaser game instances for one host element.
- Scene lifecycle leaks: listeners, timers, tweens, audio, particles, pooled sprites, or interactive zones that survive scene shutdown/restart or are never destroyed/disabled.
- Game state inconsistencies: health, ammo, cooldowns, invulnerability, power-up durations, score, enemy respawns, or game-over/restart state that can become negative, stuck, duplicated, or impossible to clear.
- Collision and map bugs: new tile codes not reflected in `tileAssetForCode`, `isTileBlocked`, spawn selection, pathing, or prop collision; coordinate math that mixes world, screen, and tile spaces incorrectly.
- Asset manifest mismatches: referenced files missing from `public/assets`, wrong frame sizes, wrong frames-per-row metadata, duplicate texture keys, or JSON/sprite-sheet changes that do not agree with the consuming animation code.
- Input/accessibility regressions: keyboard, pointer, mute, start, how-to-play, close, restart, and debug controls that stop working, trap input unexpectedly, or fail after scene restart.
- Audio regressions: sound that plays while muted, ignores browser unlock constraints, stacks duplicate loops, or fails to stop/reset on restart.
- Dependency or build changes that update only one lockfile, remove required scripts, or break `npm run build`.

## Do not over-report

- Do not ask for broad refactors of `DungeonScene.ts` unless the changed code introduces a concrete bug or makes a reviewed bug materially harder to fix.
- Do not flag first-pass art, balance tuning, spawn rates, animation timing, or procedural audio quality unless the diff creates a functional regression.
- Do not require tests for generated image/audio assets or visual-only asset refreshes, but do check that manifest references and dimensions remain consistent.
- Do not report issues already listed as known limitations in `README.md` unless the pull request claims to solve them or makes them worse.

## Review posture

- Prioritize concrete runtime bugs and player-visible regressions over style preferences.
- When a bug depends on Phaser lifecycle or browser behavior, explain the exact sequence that triggers it.
- If the fix is small and local, suggest it. If the risk is uncertain, ask for a focused manual check instead of blocking the PR.
