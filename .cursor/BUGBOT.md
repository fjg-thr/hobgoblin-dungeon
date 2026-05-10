# Cursor Bugbot Review Guide

## Project context

- This repository is a Next.js 16 app that hosts a first-playable Phaser 4 dungeon prototype.
- The playable game lives in `src/game/scenes/DungeonScene.ts`; supporting map generation and asset metadata live in `src/game/maps/startingDungeon.ts` and `src/game/assets/manifest.ts`.
- Phaser must stay client-only. `src/game/GameCanvas.tsx` dynamically imports `phaser` and `DungeonScene` inside a client component; do not move Phaser imports into server components or module paths that Next.js evaluates during SSR.

## Review priorities

1. **Runtime safety for the game loop**
   - Check for stale scene state, unbounded object creation, or missing cleanup for Phaser display objects, timers, input handlers, audio, and scale/event listeners.
   - Watch for code that bypasses existing pool limits such as `DAMAGE_NUMBER_POOL_LIMIT`, `COMBAT_EFFECT_POOL_LIMIT`, `HASTE_AFTERIMAGE_POOL_LIMIT`, and active pickup caps.
   - Verify movement, collision, projectile, enemy, pickup, and power-up changes account for both tile-space and world/screen-space coordinate conversions.

2. **Next.js/client boundaries**
   - Keep `src/app/layout.tsx` and other server-rendered files free of browser-only APIs.
   - Preserve the dynamic client boot path in `GameCanvas`; direct top-level Phaser imports in app/server modules can break builds or hydration.
   - Metadata changes should reference real files under `public/` or intentionally generated app routes.

3. **Asset manifest consistency**
   - When adding or renaming assets, confirm the file exists under `public/assets`, the manifest path matches it exactly, and Phaser loader dimensions match the sprite sheet JSON/source metadata.
   - Generated sprite sheets should keep nearest-neighbor/pixel-art assumptions intact and avoid committing temporary source or intermediate files unless the README documents them.
   - Audio additions should update both `public/assets/audio/audio-manifest.json` when applicable and `assetManifest.audio`.

4. **Gameplay tuning and accessibility**
   - For controls, keep README instructions, start/how-to-play UI copy, and implemented key bindings in sync. The code currently supports Space and pointer click for firing, while README copy may mention `J`.
   - Check that changes preserve keyboard-only play and do not make required actions mouse-only.
   - Review balance changes against existing progression gates for ammo, seekers, brutes, power-ups, health drops, and spawn caps.

5. **Maintainability**
   - `DungeonScene.ts` is intentionally centralized but large. Prefer small helpers and existing types over duplicating coordinate math or asset-loading patterns.
   - Avoid broad refactors that are unrelated to the behavior under review.
   - Keep TypeScript strictness useful: prefer explicit types for new game entities, config records, and manifest entries.

## Verification expectations

- Run `npm ci` before build verification when dependency state is uncertain.
- Run `npm run build` for changes that touch TypeScript, Next.js app files, Phaser scene code, or manifests.
- `npm run lint` currently maps to `next lint`, which is not compatible with the installed Next.js 16 CLI. Treat a `next lint` CLI parsing failure as tooling debt rather than a code regression, and rely on `npm run build` plus TypeScript diagnostics unless the lint script is updated.
- Next.js builds may regenerate `next-env.d.ts`; do not include that churn unless the route/type generation change is intentional.
