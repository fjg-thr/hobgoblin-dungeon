# Bugbot Review Guide

Use these repository-specific notes when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Review priorities

- Treat this as a browser-only Phaser game embedded in a Next.js App Router shell. Flag changes that import Phaser, read `window`, touch canvas sizing, use browser storage, or initialize audio outside client-only code.
- Watch lifecycle cleanup closely. Phaser scenes, timers, tweens, input handlers, resize listeners, keyboard handlers, audio nodes, and restart paths must be cleaned up or reset so a remount or new run does not duplicate work.
- Gameplay state primarily lives in `src/game/scenes/DungeonScene.ts`. Review changes there for broken reset behavior, unbounded object growth, stale references after game over/restart, and inconsistent interactions between ammo, powerups, enemy spawning, scoring, health, and audio mute state.
- Collision and movement are manual tile/proximity checks, not Phaser physics. Map, movement, wall, bridge, staircase, or prop changes should preserve tile-coordinate consistency and should be validated with the F3 debug overlay.
- Keep asset definitions synchronized. Any change to `src/game/assets/manifest.ts` must match files under `public/assets`, JSON metadata, frame dimensions, frame counts, and Phaser texture keys.
- Procedural dungeon changes in `src/game/maps/startingDungeon.ts` should preserve reachable player starts, enemy starts, room connectivity, walkable tile codes, and blocking-prop semantics.
- UI in the running game is Phaser-rendered, not DOM-rendered. Check responsive camera/HUD positioning, pixel-art rendering settings, and pointer/keyboard accessibility for the start, HUD, mute, and game-over flows.

## Validation expectations

- Prefer evidence from `npm run build` for repository-wide changes because no automated test suite is currently configured.
- For gameplay, rendering, input, audio, collision, map generation, or asset changes, ask for manual browser validation in addition to the build. Useful checks include: start a run, move with WASD/arrows, aim/fire, collect ammo/powerups, toggle sound, trigger game over/restart, resize the window, and inspect collision with F3.
- If `npm run lint` is changed or used, verify that the `next lint` script works with the installed Next.js version before treating lint output as authoritative.

## What to leave alone

- Generated image/audio assets and source prompt files are expected to be large and noisy. Do not request cosmetic asset rewrites unless a PR changes runtime behavior or references missing/mismatched files.
- Do not require a broad test infrastructure migration for small gameplay or asset-tuning PRs. Ask for targeted automated tests only when new pure logic or reusable helpers are introduced.
