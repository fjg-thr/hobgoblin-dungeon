# Bugbot review guidance

Use this repository-specific context when reviewing pull requests for Hobgoblin Ruin.

## Project shape

- This is a Next.js/React/TypeScript app that boots a Phaser canvas game from `src/game/GameCanvas.tsx`.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; generated map geometry is in `src/game/maps/startingDungeon.ts`.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded sprites, images, and audio. `public/assets/audio/audio-manifest.json` is auxiliary only.
- The repo currently has no Tailwind or shadcn setup. DOM-level styling uses `src/app/globals.css`; most UI/interaction is Phaser canvas state.

## High-signal review areas

- For gameplay changes, check lifecycle interactions in `DungeonScene`: preload keys, animation frame ranges, update-loop state, projectile/enemy arrays, pickup timers, score/ammo/heart HUD state, restart/game-over cleanup, and pointer/keyboard input.
- For assets, verify every manifest entry has a corresponding file under `public/assets`, correct frame dimensions, matching metadata JSON when used, and matching animation frame ranges.
- For audio, confirm new runtime sounds are added to `assetManifest.audio`, loaded by `DungeonScene.preload`, and respect the scene mute toggle.
- For map or collision changes, check isometric tile/world conversions, wall/chasm/bridge collision rules, prop depth ordering, spawn safety, and camera bounds.
- For Next/metadata changes, confirm `src/app/layout.tsx` metadata references public assets that exist, especially `/opengraph-image.png`.
- For DOM UI changes, prefer semantic elements and existing CSS patterns. For Phaser UI, review pointer zones, keyboard affordances, responsive placement, readable contrast, and canvas accessibility limitations.

## Known baseline mismatches

- README says `Space` or `J` can fire, but the current scene binds shooting to `SPACE` plus pointer/click firing. Flag this only for input/control-doc changes or PRs that claim to fix controls.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and blast. Code also includes seeker ammo unlocked by progression thresholds; review seeker behavior from code rather than README alone.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently unlocks it earlier. Treat that as existing baseline unless a PR intentionally changes blast progression.

## Verification expectations

- For TypeScript/runtime changes, prefer:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `next lint` is not reliable with the current Next version, so do not require it as the sole gate.
- Asset-generator changes should verify the exact touched scripts, for example:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- If verification dirties generated Next files such as `next-env.d.ts`, ensure the diff is intentional before approving it.

## Managed Bugbot deployment boundary

- This file gives Bugbot review context after it is merged to the default branch; a PR adding or changing this file might not be reviewed with the new rules.
- Repository files cannot prove that the hosted Cursor Bugbot service is enabled. Confirm Cursor dashboard/org settings, GitHub App repository access, Admin API credentials when used, and a PR review smoke check when those controls are available.
- Manual PR smoke triggers can be top-level comments: `cursor review` or `bugbot run`. For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` to request diagnostic detail.
