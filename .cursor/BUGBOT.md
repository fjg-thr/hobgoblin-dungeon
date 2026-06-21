# Cursor Bugbot review guidance

This file gives Cursor Bugbot repo-specific context after it reaches `main`.
Managed Bugbot enablement is controlled outside this repo by Cursor org
settings and GitHub App repository access.

## Manual review triggers

On pull requests, top-level comments can request a review with:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for extra detail

If Bugbot does not respond, verify Cursor dashboard/org settings, the GitHub
App installation for `fjg-thr/hobgoblin-dungeon`, repository access, and that
this file is on `main`. Use a small PR smoke check when dashboard access is
available.

## Project map

- Next.js App Router entry points live in `src/app/`.
- `src/game/GameCanvas.tsx` is a client-only Phaser bootstrap and teardown
  wrapper. Preserve `"use client"`, dynamic `phaser` import behavior, and
  cleanup when touching it.
- `src/game/scenes/DungeonScene.ts` owns preload, animations, combat, HUD,
  input, audio, powerups, debug overlay, and restart.
- `src/game/maps/startingDungeon.ts` owns procedural dungeon layout, tile
  codes, and collision decisions.
- `src/game/assets/manifest.ts` is the runtime source of truth for asset keys,
  paths, frame dimensions, and audio loaded by Phaser.
- `public/assets/**` contains processed art/audio and sidecar metadata.
- Asset generation/processing scripts live in both `tools/` and `scripts/`.

## High-priority review checks

1. Asset changes must keep `src/game/assets/manifest.ts` and committed files in
   `public/assets/**` in sync. New manifest paths without matching files break
   Phaser preload.
2. Runtime animation code relies on sheet layout math, not most sidecar JSON:
   actor sheets are four direction rows by ten columns; powerups and several
   effects use eight-frame row math. Check frame sizes and indexes together.
3. `public/assets/audio/audio-manifest.json` and many JSON sidecars are not the
   runtime audio/texture source of truth. Do not treat edits there as complete
   unless `manifest.ts` and scene loading also line up.
4. Gameplay changes in `DungeonScene.ts` should preserve restart cleanup,
   scene-level mute behavior, keyboard/mouse input, depth ordering, collision
   expectations, and player/enemy animation key naming.
5. Map changes should update layout generation, collision, rendering, and
   manifest assets as a set. Preloaded wall tiles are not all visibly rendered.
6. React/Next changes should preserve SSR safety for Phaser, ensure metadata
   image paths resolve to committed `public/` files, and keep DOM UI styling
   aligned with existing `src/app/globals.css`; this repo is not using Tailwind
   or ShadCN.
7. Tooling changes should avoid hard-coded local paths, undeclared runtime
   dependencies, and accidental rewrites of generated binary assets.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing conditions; flag them when
the PR claims to fix the area or makes the mismatch worse.

- README says `Space` or `J` fires, while current runtime fire input is `Space`
  plus pointer/click behavior.
- README describes blast as rare late-game, but current unlock/tuning is code
  defined in `POWERUP_CONFIG` and may unlock earlier.
- Seeker ammo exists in code but is not fully documented in README gameplay
  text.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify the matching
  `public/` asset when metadata or share-image PRs touch that area.
- Both `package-lock.json` and `pnpm-lock.yaml` are present. Prefer the package
  manager used by the PR and avoid broad lockfile churn.
- `next lint` is listed in `package.json`, but Next 16 lint behavior/config may
  not be a reliable correctness gate here.
- Existing dependency audit findings may appear during install; separate
  dependency hardening from unrelated gameplay or guidance changes.

## Verification guidance

Prefer focused checks that match the change:

- `npx tsc --noEmit`
- `npm run build`
- Relevant asset processors, for example `npm run process:assets`,
  `npm run process:death-assets`, `npm run process:combat-juice`,
  `npm run generate:powerups`, or `npm run generate:combat-assets`
- Manual browser smoke test for Phaser boot, start/restart, movement, firing,
  pickups, mute toggle, and responsive canvas behavior when gameplay or UI is
  touched

Build/typecheck can rewrite generated Next files such as `next-env.d.ts` or
create `tsconfig.tsbuildinfo`; those should remain uncommitted unless the PR is
specifically about generated Next typing behavior.

## Review output expectations

Prioritize correctness over style-only feedback. Include file and line
references, explain player-facing impact, and distinguish new regressions from
known baseline limitations. For binary assets, focus on manifest paths, frame
dimensions, animation math, and runtime loadability rather than pixel-perfect
art critique.
