# Bugbot Review Guide

This repository is a Next.js web prototype for a dark GBA-inspired isometric dungeon game. The browser game is implemented with React, TypeScript, Phaser, and generated pixel-art/audio assets.

## Review priorities

- Flag runtime bugs in Phaser scene lifecycle, especially duplicate event listeners, timers, tweens, audio, or game objects that are not cleaned up between scene restarts.
- Check player, enemy, projectile, power-up, pickup, and collision logic for edge cases around null/undefined state, stale references, cooldown timing, overlapping pickups, and game-over transitions.
- Watch for browser/server boundary mistakes in Next.js. Phaser and DOM-only APIs must stay in client components or guarded runtime code.
- Verify asset manifest changes against files under `public/assets`; missing frames, incorrect keys, or mismatched dimensions can break loading at runtime.
- Treat generated asset-processing scripts as production tooling. Flag path mistakes, destructive file writes, non-deterministic outputs, or assumptions that only hold on one platform.
- Prefer small, focused fixes that preserve the current arcade prototype feel and existing public controls documented in `README.md`.

## Project conventions

- Use TypeScript types and explicit data structures for gameplay state instead of loosely shaped objects.
- Keep React surface area minimal; most gameplay belongs in `src/game` and Phaser scenes.
- Avoid custom CSS churn unless it is needed for the full-page canvas shell; existing styling lives in `src/app/globals.css`.
- Do not commit generated binary assets unless the source prompt or processing script change requires them.

## Verification expectations

- For gameplay or asset-manifest changes, expect at least `npm run build` to pass.
- When a change touches scripts in `tools/` or `scripts/`, reviewers should look for a safe dry-run path or clear input/output paths before recommending execution.
- Manual playtest notes are useful for movement, aiming, combat, pickup, audio, and restart-flow changes because many bugs are interaction-timing issues.
