# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. This is a small
Next.js App Router game prototype that renders a Phaser scene from a React
client component. Focus reviews on regressions that would break the playable
prototype, asset pipeline, or deployment build.

## Project shape

- App entry points live in `src/app/`.
  - `src/app/page.tsx` hosts the game canvas.
  - `src/app/layout.tsx` defines metadata and OpenGraph/Twitter share images.
  - `src/app/globals.css` owns page-level styling.
- The React/Phaser boundary is `src/game/GameCanvas.tsx`.
- The main gameplay scene is `src/game/scenes/DungeonScene.ts`.
- Procedural map generation and tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Asset contracts live in `src/game/assets/manifest.ts` plus JSON/PNG/WAV files
  under `public/assets/`.
- Asset-generation and processing scripts live in `tools/` and `scripts/`.

## High-priority review risks

### React and Next.js

- `GameCanvas` is a client component and should keep Phaser behind dynamic
  imports so server rendering does not import browser-only Phaser code.
- The Phaser game instance must be created once per mounted host and destroyed
  on unmount. Watch for effects that can create duplicate games during React
  strict-mode remounts or route transitions.
- Metadata changes in `src/app/layout.tsx` should keep `metadataBase` valid for
  local development and hosted environments.
- If `/opengraph-image.png` remains referenced, verify
  `public/opengraph-image.png` is tracked.

### Phaser scene lifecycle

- Scene changes should clean up timers, tweens, keyboard handlers, pointer
  handlers, sounds, and long-lived game objects when scenes restart or shut down.
- Avoid adding browser globals or DOM listeners without paired cleanup.
- Keep pointer/keyboard interactions accessible from both mouse and keyboard
  paths where the current game UI supports it.
- Do not introduce logic that assumes a fixed viewport; the game uses resize
  scaling and should tolerate window size changes.

### Gameplay, map, and collision contracts

- Tile-code changes in `startingDungeon.ts` must stay aligned with
  `tileAssetForCode`, `isTileBlocked`, map generation, and any rendering or
  collision logic in `DungeonScene.ts`.
- Coordinate conversions between tile space and isometric world space are
  sensitive. Review movement, projectile, enemy, pickup, and camera changes for
  tile/world-space mixups.
- Combat changes should preserve finite ammo, pickup spawning, power-up gating,
  enemy respawn timing, score updates, and game-over/restart behavior.
- Be careful with randomly generated dungeon changes: the fallback map should
  remain playable, connected, and contain valid player/enemy/stair positions.

### Asset manifest and generated assets

- Every new runtime asset should be declared in `assetManifest` or loaded through
  the existing scene preload pattern.
- Manifest dimensions, frame rows, keys, and JSON metadata paths must match the
  corresponding files in `public/assets/`.
- Sprite-sheet changes can silently break animation frame indices. Check row
  ordering for characters, power-ups, projectiles, actor deaths, combat effects,
  and UI sheets.
- Generated source files under `public/assets/source` can be large; confirm they
  are intentional before accepting new binary assets.
- When asset scripts change, verify they keep deterministic paths and do not
  overwrite unrelated generated assets.

### TypeScript and performance

- Preserve `strict` TypeScript assumptions. Avoid widening key asset/gameplay
  types to `string` when a literal union or manifest-derived type exists.
- Keep hot update loops allocation-light. Avoid per-frame object churn,
  unbounded tweens, or repeated pathfinding work without throttling.
- Avoid introducing dependencies unless they are necessary for the prototype and
  are reflected in the appropriate lockfile.
- This repository currently contains both `package-lock.json` and
  `pnpm-lock.yaml`; package changes must keep the chosen package manager and
  lockfiles consistent.

## Verification expectations

For code changes, request or run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently invokes `next lint`, which is not compatible with the
  installed Next.js CLI behavior in this repo. Prefer build and TypeScript checks
  until linting is migrated.
- `next build` and `tsc --noEmit` can update `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`. These generated artifacts should not be left dirty
  unless the change intentionally updates them.
- If metadata still references `/opengraph-image.png`, verify the file exists
  and is tracked:

```bash
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
```

## Review output style

- Lead with concrete bugs, regressions, data-loss risks, security risks, or
  missing verification.
- Include file paths and line references for every finding.
- Call out when a change only updates Bugbot guidance or docs and has no runtime
  effect.
- Keep summaries short and avoid suggesting broad refactors unrelated to the
  changed files.
