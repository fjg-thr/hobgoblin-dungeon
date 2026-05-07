# Bugbot Review Guide

This repository is a Next.js prototype for a dark, GBA-inspired isometric dungeon game. The app shell lives in `src/app`, while the game runtime is a client-only Phaser scene under `src/game`.

## Review priorities

- Treat Phaser as browser-only code. Flag changes that import Phaser from server components, remove the dynamic game boot path, or access `window`, `document`, `localStorage`, pointer, keyboard, or audio APIs without an existing browser/runtime guard.
- Watch scene lifecycle cleanup closely. Input listeners, sounds, timers, tweens, masks, pooled objects, and shutdown hooks should not survive a scene restart or React unmount.
- Preserve tile-space invariants. Movement, collision, enemy pathing, projectile travel, pickups, and map generation use tile coordinates; flag mixed world/tile coordinate math, off-by-one map bounds, or new blockers that do not respect `isTileBlocked`.
- Check gameplay balance regressions for ammo, seeker shots, enemy spawning, brutes, health, power-ups, invulnerability, scoring, and game-over flow. New randomness should keep safe spawn distances and progression gates intact.
- Review per-frame work for avoidable churn. `update` paths should keep allocations and expensive scans bounded, respect `MAX_SIMULATION_DT`, and preserve existing pool limits for combat effects, damage numbers, and afterimages.
- Verify asset manifest changes against files under `public/assets`. New sprite sheets should include matching metadata when the loader expects it, use correct frame dimensions, and preserve pixel-art rendering assumptions.
- When tools or generated assets change, check that the relevant generation or processing scripts in `tools/` and `scripts/` are updated together with any README asset documentation.
- Keep UI changes compatible with the fullscreen game canvas. Do not introduce layout that interferes with pointer aim, keyboard controls, camera resize behavior, or the in-game mute/debug controls.

## Validation expectations

- Prefer `npm ci` before verification when dependencies are not installed.
- Run `npm run build` for changes touching TypeScript, Next.js, Phaser runtime code, assets referenced by imports, or configuration.
- If a change only updates documentation or Bugbot guidance, a build is optional, but still flag broken Markdown links or inaccurate commands.

## Review style

- Prioritize concrete bugs, runtime failures, asset mismatches, lifecycle leaks, and gameplay regressions over broad style preferences.
- Include file and line references with each finding and describe the player-visible or maintainer-visible impact.
- Avoid requesting large architectural rewrites unless a change creates a clear correctness or maintainability risk.
