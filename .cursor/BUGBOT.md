# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The project is a
Next.js app that hosts a client-only Phaser dungeon prototype, with most game
behavior centralized in `src/game/scenes/DungeonScene.ts`.

## Highest-priority review areas

- Flag changes that break the client/server boundary. Phaser and browser APIs
  must stay behind `"use client"` components, dynamic imports, or runtime
  guards so Next.js does not evaluate them during server rendering.
- Review Phaser lifecycle changes for leaks or duplicated state. Scene setup,
  timers, input handlers, audio, tweens, particles, and game objects should be
  destroyed or reused consistently when the scene restarts or the React
  component unmounts.
- Treat coordinate math as high risk. Validate any edits touching isometric
  tile/world conversion, actor bounds, collision checks, depth ordering, camera
  follow, projectile travel, or debug overlays.
- Check gameplay state invariants around health, ammo, score, power-ups,
  enemy respawns, pickup spawning, invulnerability windows, and game-over or
  restart flows.
- Scrutinize dungeon generation changes in `src/game/maps/startingDungeon.ts`
  for unreachable rooms, blocked starts, invalid tile codes, missing stairs,
  and props or enemies placed on blocked tiles.
- Verify asset manifest edits against files under `public/assets`. Missing
  PNG/JSON pairs, wrong frame dimensions, or mismatched manifest keys can
  surface only at runtime.

## Repository-specific conventions

- Prefer TypeScript types and narrow unions for gameplay identifiers instead
  of untyped strings.
- Keep generated or processed assets in `public/assets` and source/processing
  utilities in `tools` or documented npm scripts.
- Preserve the pixel-art rendering assumptions: nearest-neighbor assets,
  `pixelArt`, disabled antialiasing, integer-ish sprite positioning where
  appropriate, and stable sprite-sheet frame sizes.
- Avoid unrelated refactors in `DungeonScene.ts`; when reviewing broad edits,
  separate true regressions from style-only churn.

## Verification commands

When relevant, ask authors to run:

```bash
npm install
npm run build
```

The repository also has `npm run lint`, but the script uses `next lint`, which
may not be available in newer Next.js versions. If linting fails because the
command is unsupported rather than because of project code, call that out
separately from functional regressions.

For asset-processing changes, ask for the matching script from `package.json`
or the specific `tools/*` command to be run, then verify generated asset paths
and metadata are committed together.

## Review style

- Prioritize concrete bugs, runtime crashes, broken controls, rendering
  regressions, asset loading failures, and missing verification.
- Include exact files and line references in findings.
- Avoid blocking on purely subjective gameplay tuning unless it violates a
  documented invariant or makes the prototype unplayable.
