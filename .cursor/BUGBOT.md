# Cursor Bugbot Review Guide

This project is a Next.js App Router prototype that boots a Phaser dungeon game from a client component. Review changes with the following project-specific risks in mind.

## Core review focus

- Treat `src/game/scenes/DungeonScene.ts` as stateful Phaser runtime code. Check that new input handlers, timers, tweens, sounds, and game objects are cleaned up or safely owned by the scene lifecycle.
- For React/Next changes, preserve the client-only Phaser boundary in `src/game/GameCanvas.tsx`. Phaser imports should stay dynamically loaded from the browser path and must not run during server rendering.
- Keep TypeScript strictness intact. Avoid `any`, unsafe casts, and implicit nullable assumptions unless the surrounding API truly requires them.
- Asset additions must update `src/game/assets/manifest.ts` and include matching files under `public/assets`. Verify frame sizes, paths, metadata names, and animation row/frame assumptions.
- Dungeon map or collision changes should preserve walkable connectivity, blocked tile semantics, and the isometric coordinate conversions used by movement, combat, pickups, and rendering depth.
- Gameplay balance changes should account for enemy spawn pressure, projectile cooldowns, power-up rarity/unlock timing, finite ammo, and health pickup behavior together rather than in isolation.

## Common bug patterns to flag

- Browser-only globals (`window`, `document`, audio unlock behavior, pointer APIs) used outside client-only code or without lifecycle guards.
- Phaser event listeners registered without corresponding cleanup when the scene or React component is destroyed.
- Public asset paths that differ by case or extension from committed files.
- Animation definitions that assume a different frame count, row order, frame size, or spritesheet layout than the manifest/JSON metadata.
- Map generation edits that can strand the player, spawn enemies or pickups inside blocked tiles, or create unreachable stairs/objectives.
- UI/HUD changes that do not handle resize, mute state, game-over/start states, or low viewport dimensions.

## Validation expectations

- Prefer `npm run build` as the main verification command for code changes.
- If dependencies or generated assets change, confirm the relevant lockfile and generated files are intentional.
- For logic-heavy gameplay changes, request or add focused deterministic checks where practical, especially around map generation and collision helpers.
