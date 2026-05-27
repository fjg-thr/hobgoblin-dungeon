# Cursor Bugbot Review Rules

This repository is a Next.js app that hosts a Phaser-powered, browser-only dungeon game. Bugbot should focus on defects that could break gameplay, rendering, build output, or reviewability.

## Project Context

- The app router entry point is `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is the client-only boundary that dynamically imports Phaser and the game scene.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state, scene lifecycle, input handling, combat, UI overlays, audio, and restart flow.
- `src/game/assets/manifest.ts` is the source of truth for public asset paths and sprite dimensions used by the scene.
- Generated image, audio, and JSON assets live under `public/assets/**`; asset processing tools live under `tools/**`.

## Required Review Focus

If a pull request changes the Phaser scene lifecycle, input handlers, timers, tweens, audio, or restart/game-over flow, then:

- Add a blocking Bug when event listeners, timers, intervals, tweens, Phaser objects, or audio instances can survive scene shutdown or restart.
- Add a blocking Bug when restart can duplicate handlers or leave stale gameplay state such as enemies, projectiles, pickups, score, health, ammo, power-up timers, or difficulty counters.

If a pull request changes `GameCanvas.tsx`, app-router files, or imports of Phaser/game code, then:

- Add a blocking Bug when browser-only APIs such as `window`, `document`, canvas, audio, or Phaser are reachable during server rendering.
- Add a blocking Bug when the dynamic import boundary is removed or game boot can create more than one `Phaser.Game` for the same host element.

If a pull request changes assets, generated metadata, asset processing scripts, or `src/game/assets/manifest.ts`, then:

- Add a blocking Bug when manifest paths do not match files under `public/assets/**`.
- Add a blocking Bug when sprite frame dimensions, frame names, row counts, or animation keys no longer match the scene code that consumes them.
- Add a non-blocking Bug when generated assets are changed without updating the relevant manifest entry, processing script, or README asset list.

If a pull request changes combat, movement, collision, pickups, power-ups, scoring, health, ammo, spawn pacing, or map generation, then:

- Add a blocking Bug when HUD values can desync from the underlying gameplay state.
- Add a blocking Bug when a gameplay state transition can soft-lock the player, especially start screen, game over, restart, pickup collection, staircase/objective flow, or finite ammo reload behavior.
- Add a blocking Bug when collision or camera changes can place the player outside walkable bounds or make enemies/projectiles ignore expected blocking geometry.

If a pull request changes dependencies, package manager files, Next.js config, TypeScript config, or build scripts, then:

- Add a blocking Bug when `npm run build` would fail or when both lockfiles are updated inconsistently.
- Add a non-blocking Bug when a dependency is added but the change does not explain why the existing Next.js, React, Phaser, or TypeScript APIs are insufficient.

## Review Noise Controls

- Do not report purely stylistic preferences unless they hide a concrete bug.
- Do not require automated tests for sprite-only, audio-only, or README-only changes.
- Do not flag generated binary assets just because they are large; focus on whether code and metadata consume them correctly.
- Prefer one precise finding per root cause, with the affected gameplay path and reproduction conditions when possible.
