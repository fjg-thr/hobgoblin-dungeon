# Cursor Bugbot Review Guide

Use these project-specific rules when reviewing pull requests for this repository.

## Project context

- This is a Next.js app that boots a Phaser 4 game from `src/game/GameCanvas.tsx`.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: preload/create/update, input, combat, pickups, UI overlays, audio, and restart flow.
- `src/game/maps/startingDungeon.ts` generates the dungeon grid and exposes tile/collision helpers.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys and public asset paths.
- Generated and processed assets live under `public/assets`; source-generation scripts live under `tools` and `scripts`.

## Review priorities

Flag issues that can cause runtime failures or player-visible regressions, especially:

1. Client/server boundary mistakes.
   - Phaser and browser APIs must remain behind client-only code paths.
   - Server components should not import Phaser directly or touch `window`, `document`, pointer events, audio, canvas, or WebGL APIs.
2. Asset manifest drift.
   - New runtime assets must be represented consistently in `src/game/assets/manifest.ts`, `public/assets`, and any sprite-sheet metadata JSON.
   - Check frame dimensions, frame counts, keys, and paths against the consuming Phaser animation or loader code.
3. Gameplay-loop regressions.
   - Verify changes preserve pause/restart/game-over behavior, scene cleanup, timers, pooled objects, audio mute state, input registration, and `update` delta clamping.
   - Look for leaked event handlers, timers, tweens, sounds, game objects, or stale references after restart/destroy.
4. Map and collision invariants.
   - `startingDungeon.ts` should continue to produce reachable playable tiles, a valid player start, enemy starts, and a staircase.
   - Collision changes must account for tile bounds, prop blockers, wall/bridge/chasm semantics, and player/enemy radii.
5. Combat and pickup balance bugs.
   - Check ammo, seeker ammo, cooldowns, power-up timers, health/ward invulnerability, blast damage, enemy health, score, and spawn caps for off-by-one or stale-state bugs.
6. Performance in the Phaser scene.
   - Avoid per-frame object allocation, texture creation, unbounded arrays, expensive pathfinding, or DOM/React state updates inside the game loop.
   - Prefer existing object pools and helper methods when adding repeated visual effects.
7. Type safety and maintainability.
   - Keep strict TypeScript types aligned with manifest-derived unions.
   - Prefer small helpers with clear names over adding more branching to already-large methods.

## Validation expectations

When code changes are present, expect at least:

```bash
npm run build
```

For TypeScript-only or logic-heavy changes, also expect:

```bash
npx tsc --noEmit
```

If a change touches asset-processing scripts, ask for the relevant script command from `package.json`, `tools`, or `scripts`, plus confirmation that regenerated outputs are intentionally committed.

## Severity guidance

- High severity: build/runtime crashes, broken game boot, scene cleanup leaks that multiply after restart, unreachable dungeon generation, missing assets, or SSR imports of browser-only code.
- Medium severity: incorrect gameplay state transitions, imbalanced counters/timers, inconsistent asset metadata, or avoidable per-frame performance regressions.
- Low severity: local readability, naming, or documentation issues that do not affect behavior.
