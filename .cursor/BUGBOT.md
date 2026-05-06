# Bugbot Review Guide

Use this repository-specific context when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- The app is a Next.js client-rendered prototype that mounts a Phaser game through `src/game/GameCanvas.tsx`.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`; generated map data lives in `src/game/maps/startingDungeon.ts`; asset keys and public asset paths live in `src/game/assets/manifest.ts`.
- Assets are served from `public/assets/**`. Many spritesheets have companion JSON metadata, and several scripts in `tools/` or `scripts/` regenerate processed assets.
- TypeScript is strict and Next uses the `@/*` path alias for `src/*`.

## Review priorities

1. Flag lifecycle bugs in React/Phaser integration:
   - Phaser must remain client-only.
   - Game instances should be created once per mounted host and destroyed on cleanup.
   - Browser globals must not be used during server render.
2. Flag state, timing, and cleanup issues inside `DungeonScene.ts`:
   - Timers, pooled effects, tweens, input handlers, audio objects, and scene restarts should not leak across runs.
   - Hit stop, invulnerability windows, cooldowns, spawn intervals, and difficulty scaling should remain deterministic enough to reason about.
3. Verify collision and map invariants:
   - Player, enemy, projectile, pickup, and prop collision checks should agree with tile codes from `startingDungeon.ts`.
   - Random dungeon generation must preserve reachable rooms, valid spawn points, stairs, bridges, and reserved prop/player/enemy spaces.
4. Verify asset manifest consistency:
   - New or renamed public assets must be reflected in `assetManifest`.
   - Spritesheet frame sizes, row counts, animation names, and metadata paths should match the generated JSON/PNG assets.
   - Avoid hard-coded asset paths outside the manifest unless there is a clear local reason.
5. Check gameplay balance changes for regressions:
   - Ammo scarcity, enemy spawn caps, brute/seeker/power-up unlock thresholds, heart drops, and scoring changes should preserve the README-described first-playable loop.
6. Prefer focused, type-safe changes:
   - Keep shared constants and helper functions named by gameplay intent.
   - Do not introduce broad refactors in the large scene file unless they directly reduce risk for the change under review.

## Validation expectations

- Run `npm install` before local verification if dependencies are missing.
- Prefer `npm run build` for TypeScript and Next validation.
- `npm run lint` is currently configured as `next lint`; verify whether the installed Next version still supports that command before treating a lint failure as a code regression.
- If Node/npm are unavailable in the review environment, state that limitation clearly and perform static review against the changed files.

## Common false positives to avoid

- The Phaser scene intentionally uses many module-level constants for tuning values.
- Pixel-art rendering settings intentionally disable antialiasing and round pixels.
- Some collision behavior is intentionally simple and tile/proximity based; flag only changes that break documented behavior or internal invariants.
- Generated asset/source files can be large. Review their manifest references and metadata consistency rather than requiring manual inspection of every pixel.
