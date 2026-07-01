# Cursor Bugbot review guide

Use this guide when reviewing pull requests for `fjg-thr/hobgoblin-dungeon`, a
Next.js/React/TypeScript prototype that runs a Phaser dungeon game inside the
client app.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context after it is
  merged to the default branch.
- Enabling the managed Bugbot service is controlled outside this repository:
  verify Cursor dashboard or organization settings, GitHub App repository
  access, any Admin API credentials/configuration in use, and a live PR review
  smoke check when those systems are available.
- If you cannot inspect those external systems, say so. Repository files alone
  can provide review guidance but cannot prove that hosted Bugbot is enabled.
- Manual GitHub PR triggers can be tested with a top-level `cursor review` or
  `bugbot run` comment. For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and look for request IDs or service log details.

## Project shape

- Runtime entry points:
  - `src/app/page.tsx` renders the game shell.
  - `src/game/GameCanvas.tsx` mounts Phaser on the client using dynamic imports
    so the scene is not bundled into server-side rendering.
  - `src/game/scenes/DungeonScene.ts` owns gameplay, input, HUD, audio, enemy
    spawning, powerups, pickups, and combat feedback.
  - `src/game/maps/startingDungeon.ts` defines dungeon generation, tile codes,
    and map helpers.
  - `src/game/assets/manifest.ts` is the runtime source of truth for loaded
    sprites, effects, UI, and audio paths.
- Static asset metadata lives under `public/assets/**`. Keep source images,
  processed sprite sheets, JSON metadata, and manifest paths in sync when a PR
  touches assets.
- `public/assets/audio/audio-manifest.json` is auxiliary; `assetManifest.audio`
  is what the scene loads at runtime.
- This repository currently tracks both `package-lock.json` and `pnpm-lock.yaml`.
  Keep the relevant lockfile(s) consistent with any dependency changes.
- There is no checked-in CI configuration or automated game test suite. Review
  findings should rely on targeted local checks, code inspection, and smoke
  testing when gameplay changes are involved.

## Review priorities

Focus on user-visible regressions and issues that would break the playable
prototype:

1. Game startup and Phaser lifecycle: client-only mounting, scene cleanup,
   duplicate listeners, asset preload failures, resize handling, and failures
   that leave a blank canvas.
2. Gameplay behavior: movement, aim, collision, camera follow, enemy spawning,
   damage/death, hit stop, powerups, ammo economy, pickups, scoring, game-over,
   restart, and debug overlay behavior.
3. Asset contracts: manifest paths, sprite-sheet frame sizes, generated JSON
   frame counts, hardcoded animation row math, and committed generated outputs
   must agree for any asset-related PR.
4. Audio contracts: audio files referenced in `assetManifest.audio` should load
   without blocking startup and obey the scene-level mute toggle.
5. UI/metadata changes: preserve semantic DOM where relevant, existing
   `src/app/globals.css` styling patterns, responsive canvas placement, pointer
   zones, keyboard/mouse affordances, and valid share metadata.
6. Generated artifacts: avoid accepting PRs that update generated sprites,
   metadata, or audio without updating the matching source/generator inputs or
   explaining why regeneration was intentionally skipped.

## Current behavior baselines

Use these to avoid blocking unrelated PRs on known documentation/code drift, but
do block PRs that worsen the drift or claim to fix it without doing so.

- This checkout currently tracks generated JSON metadata under `public/assets/`
  but no PNG or WAV binaries. The README and `assetManifest` still reference
  runtime images/audio. Do not block unrelated code-only PRs solely because of
  this baseline, but asset PRs should include the needed binary outputs or make
  the missing-asset boundary explicit.
- README says `Space` or `J` fires. Current code binds keyboard shooting to
  `Space` and supports pointer/click firing through Phaser pointer handlers.
  Treat `J` as an existing docs/code mismatch unless an input-control PR is
  intentionally addressing it.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also unlocks seeker ammo/projectiles after progression
  thresholds. Treat seeker ammo as code-defined behavior even if docs lag.
- README describes blast as a rare late-game powerup. Current
  `POWERUP_CONFIG` controls the actual unlock/weight behavior; use the code as
  the runtime source unless a PR is specifically updating docs or tuning.
- `src/app/layout.tsx` references `/opengraph-image.png`; no matching
  `public/opengraph-image.png` is present in the current baseline. Block PRs
  that remove needed public assets, introduce new broken metadata references, or
  claim to fix share metadata without adding/updating the referenced asset.
- `src/game/maps/startingDungeon.ts` exports a fixed-seed `startingDungeon`, but
  the active scene calls `createDungeon()` for randomized runs and restarts.
  Do not assume the exported fixed map is used at runtime.

## Asset and animation invariants

- Characters and brutes use 64x64 frames laid out as 4 direction rows by 10
  frames; `DungeonScene.createActorAnimations()` uses `row * 10` for idle/walk
  and enemy attack frame ranges.
- Powerups use 32x32 frames with 8 frames per row; `POWERUP_CONFIG.row * 8`
  selects animation frames. The blast powerup is row 3.
- Actor deaths, combat juice, and pickup-intent effects use 64x64 frames and
  `framesPerRow: 8` from `assetManifest`.
- Phaser texture keys come from `assetManifest`. Renaming a key requires
  updating preload, animation, spawn, and playback references together.
- JSON sidecars are not the runtime loader source for most animation math.
  Updating metadata alone will not fix frame-size or row-layout drift.
- Chroma-key processing varies by asset family (`#00ff00` for most assets and
  `#ff00ff` for goblin/death sources). Wrong keys produce broken alpha.

## Verification guidance

Prefer targeted checks based on the diff. Useful commands for this repo:

```bash
npx tsc --noEmit --incremental false
npm run build
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/process_pickup_intent_effect_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node scripts/generate-retro-soundtrack.mjs
```

Notes:

- `next lint` is present in `package.json`, but current Next versions no longer
  make it a reliable primary check here. Prefer `npx tsc --noEmit --incremental
  false` plus `npm run build` for TypeScript/build verification.
- If `next dev`, production builds, or type generation rewrites `next-env.d.ts`
  between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, restore
  the generated-file churn unless the PR intentionally changes route typing.
- Many asset processors depend on tools that are not declared in `package.json`
  such as Python Pillow or Node `sharp`; if regeneration fails because tooling
  is missing, report the missing dependency instead of assuming the output is
  valid.
- For Markdown-only guidance changes, `git diff --check` and diff inspection are
  usually enough; do not require a full game build when no executable code,
  lockfile, asset, or manifest changed.
- For runtime gameplay changes, request or run a browser smoke test: start the
  app, open `http://localhost:3000`, start a run, move with WASD/arrows, aim
  with pointer movement, fire with `Space` and click, collect ammo/powerups,
  toggle SOUND/MUTED, restart after game-over, and verify the console is clean.

## Dependency and security notes

- Keep dependency/tooling hardening separate from scoped gameplay or Bugbot
  guidance changes unless the PR explicitly includes both.
- `phaser` is pinned to `4.0.0-rc.4`; do not casually upgrade it without focused
  runtime testing because gameplay depends on Phaser APIs.
- If dependency changes touch both lockfiles, verify the install/audit story for
  both npm and pnpm. npm `overrides` do not affect pnpm; pnpm overrides belong
  in `pnpm-workspace.yaml` when needed.
