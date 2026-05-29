# Cursor Bugbot Review Instructions

Review this repository as a client-only Next.js game prototype built with React,
TypeScript, and Phaser.

## Review focus

- Prioritize runtime bugs in `src/game/scenes/DungeonScene.ts`, especially Phaser
  lifecycle issues, stale scene state, memory leaks, timers/listeners that are not
  cleaned up, and game objects used after destruction.
- Check `src/game/maps/startingDungeon.ts` for map-generation edge cases:
  unreachable rooms, invalid tile coordinates, off-by-one bounds errors, blocked
  spawns, and mismatches between tile codes and collision behavior.
- Check `src/game/GameCanvas.tsx` for React/Next client-boundary issues, duplicate
  Phaser game initialization, resize handling regressions, and cleanup behavior.
- Flag TypeScript strictness problems, import path mistakes, broken asset keys, and
  references to assets that are missing from `public/assets`.
- Pay close attention to changes that affect player input, projectile collision,
  enemy spawning, scoring, health, ammo, power-up timers, camera behavior, and audio
  mute state.

## Project context

- The app has no backend, auth, API routes, database, or server-side game state.
- `public/assets/**` contains generated or processed sprites, audio, and manifests.
  Only flag asset changes when a code path references a missing/renamed asset or
  the manifest format is inconsistent with Phaser usage.
- `tools/**` and `scripts/**` are local asset/audio generation utilities. Review
  them for correctness when they change, but do not require production hardening.
- The README documents intentional prototype limits: simple collision, no staircase
  level transition, first-pass generated assets, and procedural audio.

## Avoid noisy findings

- Do not ask for a backend, auth layer, database, analytics, or multiplayer support.
- Do not flag the lack of automated tests as a standalone issue unless a change adds
  test infrastructure incorrectly or removes existing verification.
- Do not require hand-polished artwork, authored audio, or complete level progression
  unless a PR explicitly claims to deliver those features.
- Do not suggest large architectural rewrites of `DungeonScene.ts` unless the diff
  introduces a concrete bug that is best fixed by a small extraction.

## Expected verification

For code changes, prefer findings that can be verified with one of:

- `npm run build`
- A focused manual check of the game at `http://localhost:3000`

When reporting a bug, include the player-visible symptom or the exact code path that
would fail at runtime.
