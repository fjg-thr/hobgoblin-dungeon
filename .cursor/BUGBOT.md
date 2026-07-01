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
  - `src/game/GameCanvas.tsx` mounts Phaser on the client.
  - `src/game/scenes/DungeonScene.ts` owns gameplay, input, HUD, audio, enemy
    spawning, powerups, pickups, and combat feedback.
  - `src/game/maps/startingDungeon.ts` defines dungeon generation/map helpers.
  - `src/game/assets/manifest.ts` is the runtime source of truth for loaded
    sprites, effects, UI, and audio paths.
- Static assets live under `public/assets/**`. Keep source images, processed
  sprite sheets, JSON metadata, and manifest paths in sync.
- `public/assets/audio/audio-manifest.json` is auxiliary; `assetManifest.audio`
  is what the scene loads at runtime.
- This repository currently tracks both `package-lock.json` and `pnpm-lock.yaml`.
  Keep the relevant lockfile(s) consistent with any dependency changes.

## Review priorities

Focus on user-visible regressions and issues that would break the playable
prototype:

1. Game startup and Phaser lifecycle: client-only mounting, scene cleanup,
   duplicate listeners, asset preload failures, resize handling, and failures
   that leave a blank canvas.
2. Gameplay behavior: movement, aim, collision, camera follow, enemy spawning,
   damage/death, hit stop, powerups, ammo economy, pickups, scoring, game-over,
   restart, and debug overlay behavior.
3. Asset contracts: every manifest path must exist under `public/`; sprite-sheet
   frame sizes and JSON frame counts must match the loader/animation code.
4. Audio contracts: audio files referenced in `assetManifest.audio` must exist,
   load without blocking startup, and obey the scene-level mute toggle.
5. UI/metadata changes: preserve semantic DOM where relevant, existing
   `src/app/globals.css` styling patterns, responsive canvas placement, pointer
   zones, keyboard/mouse affordances, and valid share metadata.
6. Generated artifacts: avoid accepting PRs that update generated sprites,
   metadata, or audio without updating the matching source/generator inputs or
   explaining why regeneration was intentionally skipped.

## Current behavior baselines

Use these to avoid blocking unrelated PRs on known documentation/code drift, but
do block PRs that worsen the drift or claim to fix it without doing so.

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
