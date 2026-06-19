# Cursor Bugbot Review Guide

This repository is a Next.js App Router shell that boots a client-side
Phaser dungeon prototype. Use this file as repository-specific review context
for Cursor Bugbot.

## Managed service boundary

- This file does not enable the hosted Bugbot service by itself. Confirm
  enablement through Cursor dashboard/org settings, GitHub App repository
  access, and a live pull-request smoke review when those controls are
  available.
- These instructions are effective for hosted Bugbot after they are merged to
  the default branch. Pull requests that add or update `.cursor/BUGBOT.md` may
  not be reviewed with the updated rules yet.
- Manual review triggers can be added as top-level PR comments:
  `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- `src/app/page.tsx` mounts the game canvas.
- `src/game/GameCanvas.tsx` is the React client boundary. It dynamically
  imports Phaser and `DungeonScene`, creates a `Phaser.Game`, and destroys it
  on unmount.
- `src/game/scenes/DungeonScene.ts` contains nearly all runtime behavior:
  preload/create/update, rendering, input, combat, enemy AI, pickups,
  power-ups, HUD, start/game-over flows, debug overlay, audio, and restart
  cleanup.
- `src/game/maps/startingDungeon.ts` generates rooms, corridors, props, tile
  metadata, and isometric coordinate data.
- `src/game/assets/manifest.ts` is the runtime asset source of truth for image,
  spritesheet, and audio keys/paths. Keep it in sync with `preload()` and
  `public/assets/**`.
- `public/assets/**` contains generated atlas/manifest JSON plus expected
  runtime image/audio paths. Binary assets may be generated or supplied outside
  the current checkout.
- Asset tooling is under both `tools/` and `scripts/`, including Python/Pillow
  processors and Node-based generators.

## Review priorities

### Phaser lifecycle and React boundary

- Verify Phaser stays client-only. Do not import Phaser from server components
  or Next metadata/layout code.
- Check `GameCanvas` changes for double-mount behavior under
  `reactStrictMode`, cancellation during dynamic import, and `game.destroy(true)`
  cleanup.
- In `DungeonScene`, review scene `SHUTDOWN`, resize handler registration,
  restart flow, tweens, timers, input handlers, pooled sprites, and any
  `destroy()` paths for leaks or stale references.

### Gameplay, combat, and simulation

- Treat constants near the top of `DungeonScene.ts` as gameplay contracts.
  Changes to movement, spawn caps, damage, cooldowns, ammo, unlock thresholds,
  difficulty timers, or power-up weights need behavioral justification.
- Pay close attention to projectile lifecycle, seeker targeting, blast damage,
  hit-stop, collision checks, enemy path recalculation, and pickups. These
  systems share arrays of Phaser objects and can regress through partial
  cleanup.
- Keep input behavior consistent across keyboard, pointer, start modal, game
  over, mute toggle, and debug overlay interactions.
- When dungeon generation changes, review spawn safety, room/corridor
  connectivity, wall/floor tile consistency, depth ordering, and map-bound
  camera behavior.

### Assets, animation, and audio

- New runtime assets should update all necessary places: `assetManifest`,
  `DungeonScene.preload()`, animation frame creation, public asset files, and
  README asset documentation when user-facing.
- Animation code assumes specific frame sizes, rows, and frames-per-row for
  several sheets. Flag sprite-sheet changes that do not update frame math.
- `src/game/assets/manifest.ts` is the runtime source of truth for audio.
  `public/assets/audio/audio-manifest.json` is auxiliary and should not be
  treated as the loader source.
- Review generated-asset scripts for deterministic output paths, source image
  assumptions, Python/Pillow requirements, and accidental writes outside
  `public/assets` or `tmp`.

### Next.js, TypeScript, and UI

- Preserve strict TypeScript safety. Avoid widening gameplay data to `any` or
  weakening exported manifest/map types.
- This project does not use Tailwind. DOM/UI changes should follow the existing
  semantic HTML and `src/app/globals.css` patterns; Phaser overlays should be
  reviewed for pointer zones, keyboard affordances, readable text, responsive
  placement, and canvas-specific accessibility limitations.
- Review metadata changes in `src/app/layout.tsx` alongside public asset
  inventory and deployment URLs.

## Known baseline context

Do not block unrelated PRs solely for these existing mismatches, but do flag
them when a PR touches the relevant area:

- README says `Space` or `J` fires. Current code binds shooting to `SPACE`, plus
  pointer/click firing.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also includes seeker ammo, seeker pickups, seeker
  projectiles, and seeker unlocks after 4 kills or 30 seconds.
- README calls blast rare late-game. Current code unlocks blast after 2 kills or
  16 seconds through `POWERUP_CONFIG.blast`.
- `src/app/layout.tsx` references `/opengraph-image.png`; that file may be
  absent in a fresh checkout.
- The repo has both `package-lock.json` and `pnpm-lock.yaml`, while
  `package.json` uses `latest` for several dependencies. Prefer the existing
  package-manager choice in the changed files and avoid dependency churn unless
  the PR is intentionally about tooling.
- `npm run lint` maps to `next lint`, which is unreliable with current Next
  versions/configuration here. Prefer build and TypeScript verification.

## Verification guidance

For code changes, ask authors to run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

If verification rewrites generated Next files such as `next-env.d.ts` or creates
`tsconfig.tsbuildinfo`, those artifacts should remain clean unless the PR
intentionally changes Next type-generation behavior.

For asset or gameplay changes, also request a browser smoke test covering:
start screen, movement, shooting, pickup collection, enemy hit/death, game over,
restart, mute toggle, and `F3` debug overlay. Note when missing generated binary
assets prevent a complete runtime smoke test in the review environment.

## Review output expectations

- Lead with concrete correctness, regression, lifecycle, asset, or verification
  findings. Include file and line references when possible.
- Distinguish existing baseline limitations from new regressions introduced by
  the PR.
- Avoid broad style feedback unless it hides a real bug or maintainability risk
  in a changed area.
