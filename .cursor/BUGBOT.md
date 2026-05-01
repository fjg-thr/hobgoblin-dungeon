# Bugbot review guidance

Use these project-specific rules when reviewing pull requests for this repository.

## Project context

- This is a Next.js/React prototype that hosts a Phaser dungeon game.
- The game scene code is stateful and frame-driven; small timing, collision, and asset-loading changes can produce visible regressions.
- Sprite sheet metadata in `public/assets/**/*.json` must stay aligned with the corresponding image assets and Phaser asset keys in `src/game/assets/manifest.ts`.

## Review priorities

- Flag changes that can break the production Next.js build, especially client/server boundary issues around Phaser or browser-only APIs.
- Check gameplay changes for regressions in collision, enemy spawning, pickups, scoring, ammo, health, sound mute behavior, and start/restart flows.
- Watch for asset path or frame-key mismatches between manifests, preload calls, animation setup, and sprite sheet JSON files.
- Prefer deterministic, bounded game-loop logic. Call out unbounded timers, accumulating listeners, leaked Phaser objects, or repeated asset creation in update paths.
- For generated asset or audio scripts, verify that source paths, output paths, and manifest updates remain consistent and do not overwrite unrelated assets.

## Expected verification

- Build-impacting changes should pass `npm run build`.
- TypeScript changes should preserve strict type safety and avoid `any` unless the surrounding Phaser API requires it.
- UI or input changes should preserve keyboard, pointer, and restart accessibility where applicable.
