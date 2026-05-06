# Bugbot Review Instructions

Review this repository as a Next.js and Phaser game prototype. Focus on regressions that would break gameplay, asset loading, or production builds.

## Project context

- The app is a Next.js project that renders a Phaser-powered dungeon prototype from `src/game`.
- `src/game/scenes/DungeonScene.ts` owns most gameplay behavior, UI state, enemy spawning, pickups, collision, and input handling.
- Static sprites, JSON atlases, and audio live under `public/assets`; `src/game/assets/manifest.ts` maps those files into the game.
- Asset processing and generation scripts live in `tools/` and `scripts/`.

## High-priority review checks

- Catch changes that desynchronize asset paths, atlas JSON frame names, or manifest keys from files under `public/assets`.
- Flag gameplay state bugs such as timers or event listeners that are not cleaned up, stale Phaser objects, duplicated input handlers, or scene restart leaks.
- Watch for coordinate-space mistakes between screen, world, tile, and isometric coordinates.
- Verify UI and input changes preserve keyboard/mouse controls documented in `README.md`.
- Flag TypeScript looseness, unsafe casts, or disabled checks that hide real runtime risks.
- Check that Next.js client/server boundaries remain valid; Phaser usage should stay in client-only paths.
- Identify changes likely to break `npm run build`.

## Lower-priority notes

- This is a prototype, so avoid blocking on broad architecture refactors unless the change introduces a concrete bug or makes a reviewed area unsafe.
- Prefer small, actionable findings with file paths and the player-visible impact.
