# Cursor Bugbot review guide

Use this as repository-specific context for `fjg-thr/hobgoblin-dungeon`, a
Next.js/React/TypeScript prototype that embeds a Phaser dungeon scene.

## Deployment and triggers

- This file only provides repo-side review guidance. Enabling managed Bugbot
  requires Cursor dashboard/org settings, GitHub App repository access, and any
  Admin API credentials outside this repo.
- After this file is merged to the default branch, Bugbot should use it for PR
  reviews. PRs that add or change this file may not be reviewed with the new
  guidance yet.
- Manual top-level PR comments can request `cursor review` or `bugbot run`.
  For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and check returned request/log details.

## Project map

- `src/app/layout.tsx` owns Next metadata. It references the tracked
  `public/opengraph-image.png` asset at 1360x752 with alt text; metadata PRs
  must keep the public image, dimensions, and copy consistent.
- `src/app/page.tsx` renders the game host.
- `src/game/GameCanvas.tsx` is the client-only React/Phaser boundary. It
  dynamically imports Phaser and `DungeonScene`, creates one game instance, and
  destroys it on unmount.
- `src/game/scenes/DungeonScene.ts` contains gameplay, UI overlays, input,
  enemies, pickups, audio, and cleanup.
- `src/game/assets/manifest.ts` is the runtime asset source of truth for Phaser
  loads. `public/assets/audio/audio-manifest.json` is auxiliary and should not
  be treated as the scene loader.
- `tools/` and `scripts/` contain generated asset/audio tooling. Avoid large
  binary churn unless the PR intentionally changes assets and matching metadata.

## Review priorities

- Preserve the client/server boundary. Phaser and browser-only APIs should stay
  behind `"use client"`, dynamic imports, effects, or runtime guards.
- Confirm Phaser lifecycle cleanup for timers, tweens, input handlers, sounds,
  graphics, sprites, and scene shutdown paths. Repeated mounts should not create
  duplicate games or leaked listeners.
- Keep asset contracts synchronized: manifest keys, file paths, frame sizes,
  JSON metadata, generated sheets, and runtime animation frame ranges must agree.
- Protect map/collision expectations in `src/game/maps/startingDungeon.ts` and
  scene collision code. Coordinate-space changes should preserve camera follow,
  tile-to-world conversion, collision bounds, and debug overlay accuracy.
- Review canvas UI changes for pointer zones, keyboard affordances, responsive
  placement, readable contrast, and mute/how-to-play/start/game-over behavior.
  This repo does not currently configure Tailwind or ShadCN.
- Validate combat/resource invariants when touched: finite ammo, seeker unlocks,
  power-up weights, heart pickups, ward prevention, blast consumption, enemy
  pressure, score updates, and game-over resets.
- Keep audio loading and mute state consistent with `assetManifest.audio`; stop
  or clean up looping sounds during restart, shutdown, and game-over paths.
- Treat generated `next-env.d.ts` route-type churn as verification noise unless
  the PR intentionally changes Next generated typing behavior.
- For dependency changes, keep `package-lock.json` and `pnpm-lock.yaml`
  synchronized or explain why one ecosystem is intentionally changed.

## Existing context not to misclassify

- README mentions `Space` or `J` to fire, while the current scene binds keyboard
  firing to `SPACE`; pointer/click firing also exists. Do not block unrelated
  PRs only for this existing mismatch, but flag PRs that touch controls/docs and
  leave them inconsistent.
- README documents regular ammo and power-ups but omits seeker ammo. The code
  unlocks seeker pickups/projectiles after progression thresholds.
- README describes blast as rare late-game; current `POWERUP_CONFIG` unlocks it
  earlier by kills or elapsed time. Flag only PRs that touch this behavior or
  docs without reconciling the mismatch.

## Suggested verification

Choose the smallest set that matches the diff:

- Markdown/config-only: `git diff --check origin/main...HEAD`.
- TypeScript/source changes: `npm run build` and
  `npx tsc --noEmit --incremental false`.
- Runtime gameplay changes: smoke test start screen, how-to-play modal,
  WASD/arrows, mouse aim/click fire, Space fire, ammo/power-up pickup, mute,
  F3 debug overlay, damage, death, and restart.
- Asset changes: verify changed files exist under `public/assets`, metadata
  matches frame sizes, and affected generation commands are documented. Relevant
  commands include `npm run process:assets`, `npm run process:death-assets`,
  `npm run process:combat-juice`, `npm run generate:powerups`,
  `npm run generate:combat-assets`, `node tools/generate_audio_sfx.mjs`,
  `python3 tools/process_corporate_goblin_assets.py`,
  `python3 tools/process_spreadsheet_brute_assets.py`, and
  `node scripts/generate-retro-soundtrack.mjs`.
- Metadata/share-image changes: verify `public/opengraph-image.png` remains
  tracked and matches `src/app/layout.tsx` dimensions and alt text.
