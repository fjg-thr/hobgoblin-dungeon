# Cursor Bugbot review guide

Review this repository as a small Next.js App Router shell around a browser-only
Phaser 4 dungeon prototype. Prioritize runtime, asset-loading, and deployability
regressions over broad style preferences.

## Architecture to keep in mind

- `src/app/page.tsx` renders the React shell and `src/game/GameCanvas.tsx`.
- `GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` on the client;
  watch for server Phaser imports, strict-mode double mounts, resize cleanup, and
  canvas sizing regressions.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`: input, movement,
  combat, pickups, power-ups, HUD, audio, start/game-over screens, and debug UI.
- `src/game/maps/startingDungeon.ts` owns room/corridor generation, collision
  tiles, spawn locations, and restart map creation.
- `src/game/assets/manifest.ts` is the runtime source for Phaser asset keys,
  paths, dimensions, power-up types, and audio paths.

## High-risk review areas

- Changes to `DungeonScene.ts` need checks for Phaser lifecycle leaks, stale
  timers/listeners, depth ordering, collision math, projectile cleanup, pickup
  state drift, audio mute regressions, and restart/game-over resets.
- Changes to `startingDungeon.ts` should preserve reachable rooms, safe player
  and enemy spawn positions, bridge/wall blocking, and tile coordinate
  consistency with the isometric transforms in the scene.
- Changes to `manifest.ts` or `public/assets/**` JSON atlases must keep keys,
  paths, frame sizes, frame rows, and animation ranges in sync. Verify referenced
  generated images/audio are present.
- Runtime audio loading uses `assetManifest.audio`; treat
  `public/assets/audio/audio-manifest.json` as auxiliary unless a PR wires it in.
- Metadata/share-image edits should verify public files exist. The current
  baseline references `/opengraph-image.png`; do not block unrelated PRs solely
  for that existing drift.
- This repo uses plain CSS in `src/app/globals.css`, not Tailwind or Shadcn.
  Review DOM changes for semantic HTML/existing CSS, and Phaser UI for pointer
  zones, keyboard/mouse affordances, scaling, and canvas focus limits.

## Known baseline drift

- README says `Space` or `J` fires, but runtime and in-game help use `SPACE`
  plus pointer/click. Flag only for controls, docs, or input changes.
- README does not fully document seeker ammo. Current code has seeker pickups,
  projectiles, and HUD copy; treat scene constants/in-game help as authoritative.
- README describes blast as late/rare, while `POWERUP_CONFIG` currently unlocks
  blast earlier. Flag only if the PR changes power-up tuning or docs.
- The checkout may lack binary `.png`/`.wav` assets even when JSON manifests are
  present. For asset PRs, verify referenced binaries are tracked or generated.

## Verification guidance

- For TypeScript/runtime changes, prefer:
  - `npx tsc --noEmit --incremental false`
  - `npm run build`
- `next lint` is unreliable in this Next 16-style setup; do not make it the
  primary signal unless a PR fixes lint tooling.
- There is no test script. For gameplay changes, smoke check: load the game,
  start a run, move with WASD/arrows, aim with the pointer, fire with Space and
  click, collect ammo/power-ups/hearts, toggle SOUND/MUTED, trigger game over,
  restart, and try F3 debug.
- Next commands can rewrite `next-env.d.ts` between dev and production route
  type paths; treat that as generated churn unless intentional.
- Dependency PRs should keep `package.json`, `package-lock.json`, and
  `pnpm-lock.yaml` consistent. Phaser is pinned to `4.0.0-rc.4`; avoid upgrade
  suggestions unless the PR is dependency maintenance.

## Asset and audio tooling

Use exact tooling names when reviewing generated asset changes:

- `npm run process:assets` -> `python3 tools/process_assets.py`
- `npm run process:death-assets` -> `node tools/process_actor_death_assets.mjs`
- `npm run process:combat-juice` -> `node tools/process_combat_juice_assets.mjs`
- `npm run generate:powerups` -> `node tools/generate_powerup_sprites.mjs`
- `npm run generate:combat-assets` -> `node tools/generate_brute_ammo_sprites.mjs`
- Other direct tools include `node tools/process_pickup_intent_effect_assets.mjs`,
  `node tools/process_gpt_tile_powerup_assets.mjs`,
  `python3 tools/process_corporate_goblin_assets.py`,
  `python3 tools/process_spreadsheet_brute_assets.py`,
  `node tools/generate_polish_sprites.mjs`,
  `node tools/generate_audio_sfx.mjs`, and
  `node scripts/generate-retro-soundtrack.mjs`.

## Managed Bugbot boundary

This file provides repository-specific review context. Hosted Bugbot reviews
still depend on Cursor organization settings, GitHub App repository access, and
any Admin API credentials/service configuration outside this repo. For a PR
smoke test, a top-level GitHub comment of `cursor review` or `bugbot run` can
request a review; use `cursor review verbose=true` or `bugbot run verbose=true`
when diagnostics or request IDs are needed.
