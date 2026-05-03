# Bugbot Review Guide

Review this repository as a Next.js and Phaser browser game. Prioritize findings that can cause runtime errors, broken gameplay, performance regressions, or incorrect asset loading.

## Project context

- The app is a Next.js project using the App Router under `src/app`.
- The Phaser game is mounted through React in `src/game/GameCanvas.tsx`.
- Core game state, spawning, combat, collision, UI, audio, and scene lifecycle behavior live in `src/game/scenes/DungeonScene.ts`.
- Static game assets are served from `public/assets` and are indexed through `src/game/assets/manifest.ts` plus neighboring JSON metadata.

## Review priorities

- Flag server/client boundary mistakes, especially Phaser, `window`, `document`, pointer, keyboard, or audio APIs used outside client-only code.
- Check Phaser lifecycle changes for duplicate event listeners, timers, tweens, animations, sounds, or retained references after scene shutdown/restart.
- Treat asset path, manifest key, frame metadata, and sprite-sheet dimension mismatches as high risk because they usually fail at runtime.
- Preserve deterministic map/collision assumptions: tile coordinates, world coordinates, isometric projection, actor bounds, and wall proximity checks must stay consistent.
- Verify combat and pickup changes keep player state coherent: health cannot underflow, ammo cannot become negative, cooldowns must clear, and temporary power-ups must expire cleanly.
- Watch for broad per-frame allocations or expensive work in `update` loops, enemy AI, projectile handling, and collision checks.
- Keep TypeScript strictness intact; avoid `any`, unchecked non-null assertions, and casts that hide invalid scene or asset state.

## Expected verification

- Prefer `npm run build` for full type and Next.js validation when dependencies and Node are available.
- If build tooling is unavailable in the review environment, call that out and rely on focused static review of the changed files.
