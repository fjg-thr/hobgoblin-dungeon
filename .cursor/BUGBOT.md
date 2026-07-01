# Cursor Bugbot review guide

This repository is a first-playable Next.js/React/TypeScript prototype for a
Phaser 4 isometric dungeon game. Use this file as repository-specific context
when Bugbot reviews pull requests.

## Deployment boundary

- Treat this file as review guidance only. Managed Bugbot enablement still
  depends on Cursor dashboard/org settings, GitHub App repository access,
  optional Admin API credentials, and a live PR review smoke check after this
  guide is present on the default branch.
- Manual GitHub PR review triggers should be top-level comments such as
  `cursor review` or `bugbot run`. Use `cursor review verbose=true` or
  `bugbot run verbose=true` only when diagnostic request IDs or detailed service
  logs are needed.
- A PR that adds or edits this file may not be reviewed with the new rules until
  after the change lands on the default branch.

## Project map

- `src/app/page.tsx` renders the full-screen game shell, and
  `src/game/GameCanvas.tsx` dynamically imports Phaser on the client.
- `src/game/scenes/DungeonScene.ts` owns gameplay, input, UI overlays, enemy
  spawning/pathing, projectiles, pickups, audio, and most runtime state. Review
  edits here carefully for cross-system regressions.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor dungeon,
  tile codes, collision decisions, props, and spawn locations.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image,
  sprite, metadata, and audio paths. `public/assets/audio/audio-manifest.json`
  is auxiliary and should stay consistent when audio assets change.
- `src/app/layout.tsx` defines page metadata and currently references
  `/opengraph-image.png`; no matching file is present in this snapshot. Treat
  that as baseline context, and block metadata/share-image PRs that introduce or
  worsen broken public references, remove referenced assets, or claim to fix the
  share image without adding the asset.
- Global DOM styles live in `src/app/globals.css`. This repo does not currently
  configure Tailwind or Shadcn, so do not require those patterns for existing UI.

## Review priorities

- Gameplay changes: verify collisions, pathing, spawn safety, projectile
  lifetime, hit detection, power-up durations, cooldowns, ammo accounting,
  score/health updates, game-over/restart reset paths, and difficulty scaling.
- Phaser scene lifecycle: check that event listeners, timers, pooled objects,
  audio instances, and interactive zones are cleaned up on shutdown/restart and
  are not duplicated by React strict-mode remounts.
- Input and UX: runtime keyboard firing is bound to `SPACE`, with pointer/click
  firing also supported. README still mentions `J`, which is an existing docs
  mismatch. Only block a PR for that mismatch when the PR changes controls,
  input docs, or claims to fix control behavior.
- Canvas UI/accessibility: Phaser overlays are not DOM elements. Review pointer
  zones, keyboard reachability, visible focus/hover equivalents where practical,
  readable text at small viewport sizes, safe-area placement, and mouse/keyboard
  affordances without applying generic DOM-only accessibility checks blindly.
- Assets: when manifest paths, sprite dimensions, frame row counts, or metadata
  JSON change, confirm the referenced files exist and frame sizes align with
  Phaser `load.spritesheet` calls and animation frame ranges.
- Audio: ensure additions are loaded through `assetManifest.audio`, kept
  consistent with `public/assets/audio/audio-manifest.json`, handled by the
  scene mute/toggle behavior, and not autoplayed outside user-initiated game flow
  in ways browsers will block.
- Metadata/Next changes: preserve `metadataBase` behavior for Vercel/local URLs,
  keep share image dimensions/path accurate, and avoid client-only APIs in server
  components.
- Dependencies/tooling: keep `package-lock.json` and `pnpm-lock.yaml`
  synchronized if dependencies change. Phaser is currently pinned to
  `4.0.0-rc.4`; do not suggest upgrading it as part of unrelated PRs.

## Known baseline context

- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Code also unlocks seeker ammo/projectiles after progression thresholds.
  Treat seeker behavior as code-defined unless a PR is specifically reconciling
  README gameplay docs.
- README describes blast as a rare late-game power-up, but current
  `POWERUP_CONFIG` unlocks blast after 2 kills or 16 seconds. Treat that as an
  existing README/code mismatch unless a PR intentionally changes it.
- `next lint` is not a reliable verification command for this Next 16 baseline.
  Prefer `npm run build` and `npx tsc --noEmit --incremental false` for code
  changes. If those commands rewrite `next-env.d.ts` route type paths, restore
  the generated churn unless the PR intentionally changes Next type generation.
- Markdown-only guidance changes do not need game build/runtime verification,
  but should still pass `git diff --check`.

## Asset and audio tooling

Review generated asset changes against the exact generator/processor used:

- `npm run process:assets` (`python3 tools/process_assets.py`)
- `npm run process:death-assets` (`node tools/process_actor_death_assets.mjs`)
- `npm run process:combat-juice` (`node tools/process_combat_juice_assets.mjs`)
- `npm run generate:powerups` (`node tools/generate_powerup_sprites.mjs`)
- `npm run generate:combat-assets`
  (`node tools/generate_brute_ammo_sprites.mjs`)
- `node tools/generate_audio_sfx.mjs`
- `node tools/generate_polish_sprites.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node scripts/generate-retro-soundtrack.mjs`

For asset PRs, prefer checking the manifest diff, JSON metadata shape, and a
local game smoke test over trusting generated filenames alone.

## Suggested verification by change type

- Documentation or Bugbot guidance only: `git diff --check`.
- TypeScript/React/Next code: `npm run build` and
  `npx tsc --noEmit --incremental false`.
- Gameplay/input/canvas UI: run the app, start a game, move with WASD/arrows,
  aim with the pointer, fire with `SPACE` and click, collect ammo/power-ups,
  toggle sound, open/close how-to-play, trigger game over, restart, and test F3
  debug overlay if relevant.
- Asset/audio generation: run the matching tool above, then verify the runtime
  manifest paths and a browser smoke test that loads the affected sprites/audio.
