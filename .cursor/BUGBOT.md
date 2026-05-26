# Bugbot review guidance

Review this repository as a browser game prototype built with Next.js, React, TypeScript, and Phaser.

## Project shape

- `src/app/page.tsx` renders the game shell.
- `src/game/GameCanvas.tsx` is a client-only React bridge that dynamically imports Phaser and owns the Phaser `Game` lifecycle.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay behavior, scene state, input handling, spawning, combat, HUD, audio, and restart flows.
- `src/game/maps/startingDungeon.ts` generates the dungeon grid, collision-relevant tile data, props, and spawn positions.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys, paths, frame dimensions, and sprite metadata.
- `public/assets/**` contains generated sprite, tile, UI, effect, and audio assets consumed by the manifest and Phaser scene.

## Review priorities

Focus on issues that can break gameplay, rendering, input, or production builds:

- Next.js server/client boundary mistakes, especially direct `window`, DOM, or Phaser access outside client-only code or guarded effects.
- Phaser lifecycle leaks, duplicate `Game` instances, event listeners/timers that survive scene shutdown or React unmount, and restart flows that leave stale state.
- Asset manifest drift: missing files, mismatched frame sizes, incorrect metadata paths, duplicate keys, or references that do not match `public/assets/**`.
- Collision and map-generation regressions that can spawn the player/enemies inside blocked tiles, isolate rooms, or make pickups/objectives unreachable.
- Gameplay state bugs involving health, ammo, score, power-ups, enemy respawn timing, projectile cleanup, mute state, start/game-over/how-to-play overlays, and debug toggles.
- TypeScript or build regressions caused by strict typing gaps, implicit browser globals, async imports, or Phaser API misuse.
- Accessibility regressions in React-rendered shell elements. Phaser canvas UI has different constraints, but React controls should still be keyboard and screen-reader aware when added.

## Testing expectations

When reviewing changes, prefer concrete reproduction notes and suggest focused verification:

- `npm run build` for Next.js and TypeScript build safety.
- Manual browser smoke test for scene boot, start screen, movement, aiming/firing, collisions, pickups, enemy damage, mute toggle, restart, and resize behavior.
- Asset changes should include a manifest/path sanity check and, when applicable, a visual smoke test at nearest-neighbor pixel scale.

## Style expectations

- Keep edits scoped and consistent with the existing prototype style.
- Prefer TypeScript types and explicit interfaces for gameplay data structures.
- Preserve pixel-art rendering settings unless the change intentionally updates presentation.
- Avoid broad refactors of `DungeonScene.ts` unless required for the reviewed change; call out risky coupling when it affects correctness.
