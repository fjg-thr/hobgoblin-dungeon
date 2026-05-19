# Bugbot Review Instructions

Review pull requests for this repository as a strict correctness and regression reviewer. Lead with issues that can cause runtime failures, broken gameplay, invalid builds, or hard-to-debug state bugs.

## Project context

- This is a Next.js application that hosts a Phaser-powered dark isometric dungeon prototype.
- The browser-only game bootstraps from `src/game/GameCanvas.tsx`; keep Phaser and `window` usage inside client-side code paths.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`; map generation is in `src/game/maps/startingDungeon.ts`; asset references are centralized in `src/game/assets/manifest.ts`.
- Public assets under `public/assets` must stay aligned with the manifest paths, sprite frame sizes, and metadata JSON files.

## Review priorities

1. Call out changes that can break `npm run build`, TypeScript `strict` checks, Next.js client/server boundaries, or dynamic imports.
2. Watch for Phaser lifecycle leaks, especially duplicate game instances, unremoved timers/listeners, retained sprites, or effects that survive scene shutdown.
3. Check gameplay state transitions for edge cases: death/game-over, restart, mute toggling, ammo and power-up limits, enemy respawn, collision, camera bounds, and pickup collection.
4. Validate isometric coordinate math carefully. Flag tile/world coordinate mixups, off-by-one map bounds checks, pathfinding regressions, and collision boxes that no longer match rendered objects.
5. For asset changes, verify that each referenced PNG, WAV, and JSON file exists and that sprite sheet frame sizes, row counts, animation keys, and manifest keys remain consistent.
6. For UI changes, preserve keyboard and pointer accessibility where applicable and avoid introducing interactions that depend on unavailable browser APIs during server render.
7. Prefer focused findings about observable bugs over style-only comments. Mention missing tests or manual checks only when they materially increase regression risk.

## Validation expectations

- Prefer `npm run build` as the baseline verification for application changes.
- If a change only touches generated assets or asset-processing scripts, also review the corresponding manifest references and processor output assumptions.
- If a PR changes game loops, timers, collision, or spawn logic, ask for a focused manual playthrough of start, combat, pickup, death, restart, and mute flows when automated coverage is absent.
