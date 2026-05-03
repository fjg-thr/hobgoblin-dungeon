# Cursor Bugbot review rules

Use these repository-specific rules when reviewing changes in this project.

## Project context

- This is a Next.js app that boots a Phaser dungeon prototype from `src/game/GameCanvas.tsx`.
- Most gameplay state, rendering, input, spawning, pickups, audio, and UI behavior lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite sheet dimensions are centralized in `src/game/assets/manifest.ts`.
- Many files under `public/assets` are generated. Review generated asset metadata only for consistency with the manifest and loader expectations.

## Review priorities

- Flag runtime bugs that can break the game loop, scene boot, hot reload teardown, resize handling, or browser-only execution in Next.js.
- Pay close attention to Phaser lifecycle cleanup. New timers, event listeners, keyboard handlers, tweens, sounds, or game objects should be removed or made scene-owned so restarts and React unmounts do not leak behavior.
- Check collision, pathfinding, spawn, pickup, and projectile changes against the tile coordinate system. Tile coordinates should remain distinct from screen/world pixel coordinates.
- Verify any new asset reference is present in `assetManifest`, uses the correct public path, and has frame dimensions that match the corresponding sprite sheet metadata.
- For gameplay constants, look for regressions that make early play unfair: unavoidable spawn proximity, ammo starvation, health pickups that cannot be reached, or enemies attacking outside their intended ranges.
- For audio changes, preserve the scene-level mute behavior and avoid starting duplicate ambience or music loops across restarts.
- For React and Next.js changes, keep Phaser imports browser-only unless the imported module is safe during server rendering.
- For TypeScript changes, preserve `strict` compatibility and avoid weakening types with broad casts or `any` unless a Phaser API boundary requires it and the cast is narrow.

## Expected validation

- Run `npm run build` for changes that touch TypeScript, React, Next.js config, Phaser scene code, asset manifests, or public asset paths.
- If asset processing scripts are changed, run the relevant `npm run process:*` or `npm run generate:*` command when practical and confirm generated metadata stays aligned with `assetManifest`.
- Do not require tests for pure generated binary asset updates, but do require a build or targeted script run for code or manifest changes that consume those assets.
