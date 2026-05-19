# Cursor Bugbot Review Guide

Use this guide when reviewing changes for the Hobgoblin Ruin Prototype. The project is a Next.js App Router app that hosts a client-only Phaser dungeon prototype.

## Repository shape

- `src/app/page.tsx` should stay a thin route that renders `GameCanvas`.
- `src/game/GameCanvas.tsx` is the browser-only boundary. Phaser must remain dynamically imported inside the client component effect so server rendering and static metadata generation do not import Phaser.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`. Changes there can affect input, scene lifecycle, rendering depth, audio, combat, spawning, pickups, and HUD state at the same time.
- Static asset paths are centralized in `src/game/assets/manifest.ts`; generated map data and tile codes are in `src/game/maps/startingDungeon.ts`.
- Sprite sheets and metadata live under `public/assets`. Tooling for generated assets lives under `tools`.

## High-priority review checks

1. **Next.js and client-only Phaser boundary**
   - Flag any server component, metadata, layout, or module-level import that can load Phaser outside the `"use client"` boundary.
   - Verify `GameCanvas` still creates one Phaser game per mounted host element and destroys it on unmount.
   - Check resize, pixel-art, and full-window behavior if canvas configuration changes.

2. **Scene lifecycle and state resets**
   - In `DungeonScene`, ensure restarting, returning from game-over, and starting a new run reset projectiles, enemies, pickups, timers, temporary effects, score, ammo, seeker ammo, health, mute UI references, and spawned tweens.
   - Watch for Phaser objects retained in arrays after destruction; filtered arrays should keep update loops from touching inactive sprites.
   - Confirm one-time input handlers, timers, audio, and tweens are not duplicated across scene restarts.

3. **Gameplay controls and combat**
   - Current code binds movement to WASD/arrows, shooting to Space, mouse click to aim/fire, Escape for overlay closing, and F3 for debug. README also mentions `J` firing, but `DungeonScene` currently does not bind `J`; flag changes that preserve or widen that mismatch without intent.
   - Check staff-bolt direction snapping, cooldowns, finite standard ammo, seeker ammo, no-ammo popups, projectile cleanup, hit stop, knockback, enemy damage, blast damage, and enemy death scoring together.
   - For power-ups, verify quickshot, haste, ward, and blast timers/effects are reset and reflected in HUD text. Ward should block contact damage without hiding real damage regressions.
   - Heart pickups should restore missing hearts only; they should not increase max health.

4. **Spawning, progression, and map collision**
   - Dungeon generation uses tile codes from `startingDungeon.ts`; new tile codes must be handled by rendering, collision, safe-spawn, depth, and debug overlays.
   - Player, enemy, ammo, power-up, and heart spawn logic should avoid walls, blockers, props, chasms, and unsafe proximity to the player unless a behavior change is explicit.
   - Enemy pressure ramps over time/kills. Brutes, seeker ammo, heart drops, and late-game blast availability are progression-gated; review changes for accidental early unlocks or impossible unlocks.
   - Check depth ordering for actors, walls, bridges, chasms, props, projectiles, pickups, popups, and HUD after rendering changes.

5. **Assets and generated metadata**
   - Any new asset in `assetManifest` should have a corresponding file under `public/assets` and should be loaded/preloaded before use.
   - Sprite sheet frame dimensions, row indices, animation frame ranges, and JSON metadata must match the generated files.
   - If a tool under `tools` regenerates assets, confirm the generated JSON and PNG paths stay consistent with `README.md` and `assetManifest`.
   - Audio keys in `assetManifest.audio` should remain preloaded and should respect the scene-level mute toggle.

6. **App metadata and public assets**
   - `src/app/layout.tsx` references `/opengraph-image.png`. This repository currently does not include `public/opengraph-image.png`; flag metadata or asset changes that claim the file exists, silently break sharing images, or preserve the missing asset without acknowledging the intent.
   - Keep metadata environment handling compatible with `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, and local development.

7. **Documentation consistency**
   - README controls and gameplay descriptions should match code changes. Pay special attention to Space-vs-`J` firing, seeker ammo behavior, power-up gating, sound controls, and the lack of level-transition behavior for the staircase.
   - Do not treat `package.json`'s `"private": true` as GitHub repository visibility; it only prevents npm publishing.

## Verification to request or run

- `npm ci`
- `npm run build`
- `npx tsc --noEmit --incremental false`
- For asset-heavy changes, inspect or script-check that each manifest path exists under `public`.
- For gameplay changes, run a browser smoke test when available:
  - start screen opens and starts a run
  - WASD/arrows move in isometric directions
  - mouse aim, click firing, and Space firing work
  - ammo pickups refill standard or seeker ammo as intended
  - enemies damage the player and can be killed
  - quickshot, haste, ward, blast, heart pickups, sound toggle, game over, restart, and F3 debug overlay still work

`npm run lint` currently maps to `next lint`, which is not an integrated subcommand under the installed Next.js version and fails with an invalid project-directory error. Prefer `npm run build` and `npx tsc --noEmit --incremental false` until the lint script is migrated to a supported ESLint command.

## Review output expectations

- Prioritize concrete defects that can break runtime behavior, builds, asset loading, or documented controls.
- Include file and line references when possible.
- Avoid broad style refactors unless they remove a real bug or reduce risk in touched code.
- If no issues are found, say so and mention any unverified smoke-test areas.
