# Cursor Bugbot Review Instructions

Review this repository as a first-playable Hobgoblin Ruin browser game built
with Next.js, React, TypeScript, and Phaser. Prioritize concrete defects that
can break production builds, server/client boundaries, asset loading, Phaser
scene lifecycle, or player-facing gameplay described in `README.md`.

## Project Map

- `src/app/layout.tsx` owns metadata and the global document shell.
- `src/app/page.tsx` renders the game page and should stay thin.
- `src/game/GameCanvas.tsx` is the React client boundary. It dynamically imports
  Phaser and `DungeonScene`, then creates one `Phaser.Game` per mounted host.
- `src/game/scenes/DungeonScene.ts` contains most runtime state: input, combat,
  enemy AI, pickups, power-ups, UI overlays, audio, camera, debug rendering, and
  scene cleanup.
- `src/game/maps/startingDungeon.ts` generates rooms/corridors and defines tile
  blocking semantics.
- `src/game/assets/manifest.ts` is the source of truth for public asset paths,
  sprite dimensions, animation metadata, and audio keys.
- `public/assets/**` contains runtime assets. Many JSON, sprite, audio, and
  source files are generated through `tools/**`; generated churn should be
  intentional and tied to a source or tool change.

## High-Priority Review Checks

### Next.js and React Boundaries

- Flag static imports of `phaser` or `DungeonScene` from server components.
  Phaser should remain behind `"use client"` and dynamic imports in
  `GameCanvas.tsx` so builds and SSR never evaluate browser-only APIs.
- Check that `GameCanvas` preserves the single-game invariant: no duplicate
  `Phaser.Game` instances for one host, and the game is destroyed on unmount.
- Browser globals (`window`, canvas, pointer APIs, local storage, Web Audio)
  should only run from client-only code paths.
- Metadata image paths must stay in sync with committed files under `public/`.
  In particular, `src/app/layout.tsx` references `/opengraph-image.png`;
  changes near metadata should ensure that asset exists or update the reference.

### Phaser Scene Lifecycle

- New listeners, timers, tweens, graphics, containers, sounds, or pooled game
  objects in `DungeonScene` must be cleaned up on scene shutdown/restart.
- Watch for duplicate handlers when starting a run, restarting after game over,
  muting/unmuting, opening the how-to-play overlay, or toggling debug UI.
- A fresh run should reset related UI, audio, enemy, projectile, pickup,
  power-up, score, ammo, health, focus mask, and debug overlay state.
- Avoid unbounded object creation in `update`; use existing pools or destroy old
  effects when adding recurring visual feedback.

### Gameplay Invariants

- Movement, projectile travel, enemy movement, knockback, and pickup collection
  rely on tile/world coordinate conversion. Preserve isometric coordinates,
  depth ordering, camera follow, and collision radius math.
- `isTileBlocked`, prop blocking, chasm/bridge tiles, safe-spawn checks, and
  enemy pathing must agree. Flag changes where something is visually walkable
  but logically blocked, or logically walkable through an obstacle.
- Enemy and pickup spawning should respect caps and progression gates such as
  `MAX_ENEMIES`, `MAX_BRUTES`, active pickup limits, unlock kill counts, and
  elapsed-time unlocks.
- Ammo, seeker ammo, quickshot, haste, ward, blast, and heart pickups should
  preserve max counts, rarity, duration, pickup feedback, and HUD state.
- Combat changes should account for invulnerability windows, hit stop, damage
  numbers, death effects, score increments, drops, and game-over timing.
- Keep controls and docs aligned. `README.md` documents WASD/arrow movement,
  pointer aiming, click-to-fire, `Space` or `J` firing, lower-right
  `SOUND`/`MUTED`, and `F3` debug controls; flag changed behavior or docs that
  leave those controls inconsistent.

### Assets, Generated Files, and Dependencies

- Every `assetManifest` path should exist under `public/`, use the expected
  leading slash runtime path, and match the frame dimensions used by Phaser.
- Sprite metadata JSON changes should match the corresponding PNG layout,
  `framesPerRow`, frame dimensions, frame order, and animation row assumptions.
- Binary assets should change only when the PR intentionally updates game art,
  audio, UI, or generated sources. Avoid unrelated churn in generated files.
- Treat generated `next-env.d.ts` edits from local builds as noise unless the
  TypeScript or Next.js configuration intentionally changed.
- This repository currently has both `package-lock.json` and `pnpm-lock.yaml`.
  Flag dependency changes that update only one lockfile unless the package
  manager decision is explicit.

## Finding Standards

- Report only actionable, high-confidence issues tied to changed code.
- Include the user-visible consequence and the minimal code path that triggers
  the issue.
- Do not request broad `DungeonScene.ts` rewrites, style-only changes, or
  speculative performance work unless they prevent a concrete bug.
- Prefer existing project patterns and dependencies. Do not suggest new
  libraries unless the current stack cannot address the issue.
- Do not flag known prototype limitations from `README.md` unless a change makes
  an existing limitation worse or contradicts documented behavior.
- For visual or gameplay changes without automated coverage, ask for a short
  manual smoke-test description covering the affected controls and game state.

## Suggested Local Verification

Use the narrowest useful checks for the files changed. These baseline commands
are useful when dependencies are available:

```bash
npm ci
npm run build
git diff --check
```

If a PR changes generated assets or asset-processing code, also run the relevant
generator or processor command from `package.json`, `README.md`, or the changed
tool.
