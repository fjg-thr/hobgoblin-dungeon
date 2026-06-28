# Cursor Bugbot Review Guide

Use this guide when reviewing PRs for the Hobgoblin Ruin prototype.

## Deployment boundary

This file gives Bugbot repository-specific review context. It does not prove the hosted Bugbot service is enabled. Confirm those parts outside the repo:

- Cursor dashboard/org setting has Bugbot enabled for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Any Admin API rollout has valid credentials and targets this repo.
- After this file is on the default branch, smoke-test a PR with a top-level `cursor review` or `bugbot run` comment. For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` to get request/log detail.

Rules in this file apply after they are merged to the default branch; a PR that introduces or changes this file may be reviewed with older/default rules.

## Project map

- App shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- Phaser boot: `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Asset manifest loaded at runtime: `src/game/assets/manifest.ts`.
- Dungeon generation/collision map: `src/game/maps/startingDungeon.ts`.
- Runtime assets: `public/assets/**`; OpenGraph metadata expects tracked `public/opengraph-image.png`.
- Asset/audio tooling: `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_corporate_goblin_assets.py`, `tools/process_gpt_tile_powerup_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/process_spreadsheet_brute_assets.py`, `tools/generate_polish_sprites.mjs`, `tools/generate_powerup_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, `tools/generate_audio_sfx.mjs`, and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Gameplay regressions in movement, aiming, projectile lifetime, collision, enemy pathing, damage, pickup spawning, scoring, game-over/restart, and mute/audio behavior.
2. Phaser lifecycle problems: duplicate game instances, leaked tweens/timers/listeners, stale scene state after restart, unbounded object growth, and assets referenced without being loaded from `assetManifest`.
3. Next/React integration issues: client/server boundaries, dynamic Phaser import behavior, generated `next-env.d.ts` churn, metadata asset paths, and fullscreen/responsive canvas behavior.
4. Asset consistency: JSON frame dimensions must match sprite sheets; manifest keys/paths must line up with files in `public/assets`; generated assets should stay pixel-art friendly.
5. Dependency and package-manager drift. Both `package-lock.json` and `pnpm-lock.yaml` are tracked, so security or install changes must keep npm and pnpm paths coherent.

## Current baseline caveats

Do not block unrelated PRs solely for these existing mismatches, but flag PRs that touch the relevant area without resolving or documenting them:

- README says `Space` or `J` fires, while current code binds keyboard firing to `SPACE`; pointer/click firing is supported. In-game instructions mention click or `SPACE`.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast. Current code also includes seeker ammo/projectiles that unlock after progression thresholds.
- README describes blast as rare late-game; current `POWERUP_CONFIG` can unlock blast earlier by elapsed time or kills.
- This repo does not configure Tailwind. For DOM UI, follow semantic markup and existing `src/app/globals.css` patterns. For Phaser UI, review pointer zones, keyboard/mouse affordances, responsive placement, and canvas-specific accessibility limitations.

## Suggested verification

Prefer focused checks for the changed area, plus these before approving broad changes:

```bash
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png
npm ci
npm audit --omit=dev
pnpm install --frozen-lockfile
pnpm audit --prod
npx tsc --noEmit --incremental false
npm run build
pnpm exec tsc --noEmit --incremental false
pnpm run build
```

If builds rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, treat it as generated Next route-type churn unless the PR intentionally changes route typing behavior.

## Asset tooling checks

When a PR changes generated assets, require the exact relevant command and inspect the emitted PNG/JSON pairs:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```
