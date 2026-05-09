# Cursor Bugbot Review Guidance

This repository is a Next.js app that hosts a client-only Phaser dungeon prototype. When reviewing changes, prioritize defects that would break production builds, Phaser lifecycle behavior, gameplay invariants, asset loading, or deployed social metadata.

## Project shape

- App entry points live under `src/app`. `src/app/page.tsx` renders the game shell and `src/app/layout.tsx` owns metadata, including OpenGraph/Twitter share image data.
- The Phaser game is bootstrapped from `src/game/GameCanvas.tsx`, which must remain a client component and dynamically import `phaser` plus `DungeonScene`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset paths and frame metadata are centralized in `src/game/assets/manifest.ts` and point at files in `public/assets`.

## Review priorities

### Next.js and React boundaries

- Flag server/client boundary regressions. Phaser, `window`, DOM APIs, canvas access, audio playback, and pointer/keyboard input should stay behind `"use client"` and runtime effects.
- `GameCanvas` should not instantiate more than one `Phaser.Game` for the same host. Its cleanup must destroy the game and clear refs so React remounts, route changes, and development Strict Mode do not leak canvases or listeners.
- Metadata changes in `layout.tsx` should keep `metadataBase`, OpenGraph, and Twitter image definitions consistent with the files committed under `public`.

### Phaser scene lifecycle

- Review Phaser event, input, timer, tween, animation, audio, and texture usage for cleanup or idempotency. Scene restarts and game destruction should not leave duplicate handlers, running timers, or stale objects.
- Avoid findings about ordinary Phaser object creation unless there is a concrete leak, missing cleanup path, or repeated registration on restart.
- Keep resize, camera, and pixel-art settings compatible with full-window gameplay.

### Gameplay invariants

- Movement, pathing, collision, pickups, projectiles, and enemy spawning should respect tile coordinates, map bounds, blocked tiles, and prop collision boxes.
- Any change to `TileCode`, `PropKind`, tile dimensions, map size, or `isTileBlocked` should be checked against rendering, pathfinding, spawn selection, pickups, and projectile collision.
- Power-up, ammo, heart, enemy, and projectile pool limits should remain bounded. Flag changes that allow unbounded growth of sprites, arrays, timers, or tweens during normal play.
- When reviewing combat changes, check invulnerability windows, hit stop, cooldowns, projectile lifetime, enemy respawn timing, and game-over behavior for accidental double-application.

### Assets and manifests

- Manifest entries must match actual files in `public/assets`, including image/audio paths, JSON metadata paths, frame dimensions, frame row counts, and animation key expectations.
- Sprite-sheet metadata changes should stay consistent with the generated PNG dimensions and the loader logic in `DungeonScene`.
- Do not require generated source-art or intermediate files unless runtime code or documented tooling depends on them.
- If asset-processing scripts under `tools/` or `scripts/` are changed, check that committed outputs and manifest references are updated together.

### Social preview assets

- `/opengraph-image.png` is used by both OpenGraph and Twitter metadata. If its dimensions, path, or alt text change, `src/app/layout.tsx` should be updated in the same change.
- Treat missing or stale social preview files as deploy-impacting because metadata references are resolved at build/runtime.

### Dependency and lockfile hygiene

- This repo currently has both `package-lock.json` and `pnpm-lock.yaml`. Flag dependency changes that update only one lockfile or leave the package manager state inconsistent.
- Do not suggest dependency upgrades solely because versions are broad unless the change being reviewed touches dependency management or introduces a concrete compatibility/security issue.

## Finding standards

- Report only actionable, reproducible issues tied to the diff. Include the file, line, condition, and expected failure mode.
- Prefer bugs, regressions, missing cleanup, missing assets, broken builds, and gameplay state corruption over style-only comments.
- Do not flag intentional use of large Phaser scene methods as a defect unless the diff makes the code incorrect or materially harder to maintain.

## Local verification commands

Use these checks when relevant:

```bash
npm ci
npm run build
git diff --check
```

`npm run lint` is defined in `package.json`, but this Next.js version may not provide `next lint`; prefer the build as the baseline verification unless lint support is added.
