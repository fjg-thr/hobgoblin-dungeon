# Cursor Bugbot review guide

This repository is a Next.js/React/TypeScript wrapper around a Phaser dungeon prototype. Treat `src/game/scenes/DungeonScene.ts`, `src/game/maps/startingDungeon.ts`, and `src/game/assets/manifest.ts` as the main gameplay/runtime surface.

## Review priorities

- Prioritize runtime bugs, broken assets, player-control regressions, collision/pathing mistakes, audio loading issues, metadata/share-card breakage, and changes that make the game impossible to start, restart, aim, shoot, or mute.
- Keep findings specific and actionable. Do not block on unrelated existing limitations from `README.md` unless the PR changes that area or claims to fix it.
- For Markdown-only guidance changes, focus on accuracy, contradictions, and whether instructions could mislead future reviews.

## Gameplay and Phaser hotspots

- `DungeonScene.ts` is large and stateful. Check edits for stale timers, arrays not cleaned up on restart/game over, pooled objects left visible/active, and depth/order regressions for sprites, HUD, damage numbers, overlays, and pickup intent effects.
- Input currently supports WASD/arrow movement, mouse aiming, pointer/click firing, and `SPACE` firing. The README also mentions `J`, but the current runtime binding is `SPACE` only; do not block unrelated PRs solely for that existing mismatch.
- Review projectile/ammo changes across standard and seeker paths. Seeker ammo is code-defined and progression-gated, but not fully documented in README.
- Power-up behavior is driven by `POWERUP_CONFIG`. README describes blast as rare late-game, while the current config unlocks it earlier; treat that as a known baseline mismatch unless the PR intentionally changes documentation or tuning.
- Map generation in `startingDungeon.ts` must preserve reachable playable tiles, safe player/enemy spawn selection, and consistency between tile codes, collision checks, and tile asset keys.

## Asset and audio rules

- Runtime asset loading source of truth is `src/game/assets/manifest.ts`, including `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- If a PR changes manifest keys, generated spritesheets, JSON metadata, or public asset paths, verify that Phaser load keys, frame dimensions, animation names, and file paths still match.
- Asset generator/processor tooling includes:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- When generated assets are updated, check that the corresponding source/processor path, sprite dimensions, metadata JSON, manifest entries, and README asset references remain coherent.

## Next.js, DOM, and UI review

- Next.js pages live under `src/app`. The game canvas is mounted through `src/game/GameCanvas.tsx`.
- This repo does not currently configure Tailwind. For DOM UI changes, prefer existing semantic markup and `src/app/globals.css` conventions; for Phaser UI, review canvas-specific pointer zones, keyboard/mouse affordances, responsive placement, readable text, and mute/start/retry interactions.
- `src/app/layout.tsx` references `/opengraph-image.png`. If metadata changes touch share images, confirm the referenced public file exists and dimensions/alt text remain valid.
- Next 16 can rewrite `next-env.d.ts` between dev and production route type paths. Do not accept unrelated generated typing churn unless the PR intentionally changes Next type generation behavior.

## Verification expectations

- For code changes, prefer `npm run build` and `npx tsc --noEmit --incremental false`. `next lint` is not reliable in this project.
- For Markdown-only Bugbot guidance changes, `git diff --check` and a narrow review of the changed instructions are sufficient.
- If dependency or lockfile changes appear, scrutinize both `package-lock.json` and `pnpm-lock.yaml`; npm overrides do not automatically apply to pnpm.

## Managed Bugbot deployment boundary

- This file gives repository-specific context to Cursor Bugbot; it does not by itself prove the managed Bugbot service is enabled.
- To confirm deployment, verify Cursor dashboard/org Bugbot settings, repository-provider/GitHub App access for `fjg-thr/hobgoblin-dungeon`, and any Admin API credentials or repository rules used outside this repo.
- When a PR is available, smoke-test Bugbot with a top-level comment such as `cursor review` or `bugbot run`. For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` to request diagnostics, logs, or request IDs.
- Hosted Bugbot applies project rules after `.cursor/BUGBOT.md` is merged to the branch Bugbot reads, usually the default branch. A PR adding this file may not be reviewed with these new rules yet.
