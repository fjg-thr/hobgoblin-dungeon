# Cursor Bugbot Review Guide

Use this file as repository-specific review context for Cursor Bugbot. It does not enable the managed Bugbot service by itself; confirm Cursor org/project settings, GitHub App repository access, and any Admin API credentials outside the repo. After this file is merged to the default branch, smoke-test a PR review with a top-level `cursor review` or `bugbot run` comment. Use `cursor review verbose=true` or `bugbot run verbose=true` when troubleshooting request IDs or service logs.

## Project map

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`.
- Phaser runtime: `src/game/GameCanvas.tsx`, `src/game/scenes/DungeonScene.ts`.
- Dungeon data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Generated/static assets: `public/assets/**`; prompt history: `ASSET_PROMPTS.md`.
- Audio manifest note: `public/assets/audio/audio-manifest.json` is auxiliary. The scene loads audio from `assetManifest.audio`.

## Review priorities

1. Treat `DungeonScene.ts` as the highest-risk file. Look closely at game-state resets, timers, input listeners, hit stop, projectile lifecycles, pickup spawning, depth ordering, coordinate transforms, and cleanup on scene shutdown.
2. For gameplay changes, verify collisions against walls/props, enemy contact damage, ward blocking, ammo consumption, seeker projectile targeting, blast damage, heart drops, score updates, and game-over/restart state.
3. For asset changes, ensure every manifest entry has matching tracked files under `public/assets/**`, sprite-sheet frame sizes match JSON/source expectations, and generated assets remain nearest-neighbor/pixel-art friendly.
4. For Next/UI/metadata changes, preserve the canvas-first app structure and existing `globals.css` style patterns. This repo does not currently use Tailwind or ShadCN. If metadata references `/opengraph-image.png`, require the public image to be tracked.
5. Keep dependency upgrades narrow. Phaser is pinned at `4.0.0-rc.4`; do not request a runtime Phaser upgrade unless the PR intentionally changes engine compatibility.

## Current behavior caveats

- README says `Space` or `J` fires, but current keyboard handling binds `SPACE`; pointer/click firing is also supported. Flag this only on input/control-doc PRs, not unrelated changes.
- README documents regular ammo and power-ups, while code also includes seeker ammo unlocks and seeker projectiles. Review seeker behavior from code unless a PR updates docs.
- README describes blast as rare late-game, but current unlock/drop logic is defined by `POWERUP_CONFIG`; treat README/code mismatch as existing unless a PR touches power-up progression.
- The staircase is visible but has no level transition; do not require exit-state behavior unless a PR claims to add it.

## Verification suggestions

Use the narrowest set that matches the PR, but prefer:

```bash
npm ci
npm audit --omit=dev
npx tsc --noEmit --incremental false
npm run build
```

If a PR changes pnpm lock data, also run:

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm exec tsc --noEmit --incremental false
pnpm run build
```

For asset/audio generator changes, run the exact affected command instead of a broad wildcard:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
python3 tools/process_spreadsheet_brute_assets.py
python3 tools/process_corporate_goblin_assets.py
node tools/generate_powerup_sprites.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```
